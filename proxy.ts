import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { decideLocaleRoute, LANG_COOKIE, localePath, stripLocale } from '@/lib/i18n-routing'

// Routes that require a signed-in user, written without the locale (/en/dashboard is /dashboard).
// One entry per line to keep merges easy.
const PROTECTED_ROUTES = [
  '/dashboard',
  '/doctors/book',
  '/tracker',
  '/report-area',
  '/support',
]

function isProtected(pathWithoutLocale: string): boolean {
  return PROTECTED_ROUTES.some((p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // 1. Static files and framework internals are not our business (the matcher already skips most of them).
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('manifest.json') ||
    pathname === '/sw.js' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/offline.html'
  ) {
    return NextResponse.next()
  }

  // 2. Language. Every page lives under /en or /ar; a bare path ("/", "/recipes") is sent to the
  // visitor's preferred language. /api and files are left alone.
  const decision = decideLocaleRoute({
    pathname,
    search,
    cookieLang: request.cookies.get(LANG_COOKIE)?.value,
    acceptLanguage: request.headers.get('accept-language'),
  })
  if (decision.action === 'redirect') {
    const redirect = NextResponse.redirect(new URL(decision.location, request.url), decision.status)
    // The target depends on the cookie and the browser's language, so it must never be shared.
    redirect.headers.set('Vary', 'Cookie, Accept-Language')
    redirect.headers.set('Cache-Control', 'private, no-store')
    return redirect
  }
  const lang = decision.lang
  // Server actions and handlers cannot see the route param; they read the language from this header.
  if (lang) request.headers.set('x-lang', lang)

  const isProtectedRoute = isProtected(stripLocale(pathname))
  // Supabase stores the session in cookies named sb-<project>-auth-token (possibly chunked: ...-token.0).
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))

  // A protected page without any session cookie cannot have a signed-in user: no need to ask Supabase.
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL(localePath(lang ?? 'en', '/login'), request.url))
  }

  // Anonymous visitors on public pages need nothing from Supabase. Skipping the client
  // here removes a network round trip from the time-to-first-byte of every such page.
  if (!isProtectedRoute && !hasSession) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  if (isProtectedRoute) {
    // 2. Protected routes: verify the user with Supabase (and refresh the session if needed).
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL(localePath(lang ?? 'en', '/login'), request.url))
    }
  } else {
    // 3. Public routes with a session cookie: only keep the session fresh (this is what stops
    // the user from being signed out after the access token expires). getSession() reads the
    // cookie and talks to Supabase only when the token has actually expired, so most requests
    // cost nothing, unlike getUser() which is a network call every time.
    await supabase.auth.getSession()
  }

  return response
}

// The matcher skips static assets; locale and session handling for everything else happens above.
export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|manifest.json|sw.js|swe-worker|workbox-|offline.html|robots.txt|sitemap.xml|icons|opengraph-image).*)'],
}
