import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require a signed-in user. One entry per line to keep merges easy.
const PROTECTED_ROUTES = [
  '/dashboard',
  '/doctors',
  '/tracker',
  '/report-area',
  '/support',
]

// تأكدي أن اسم الدالة هو "proxy" كما يطلب الخطأ
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. استثناء الملفات الثابتة لزيادة الأداء
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

  const isProtectedRoute = PROTECTED_ROUTES.some((p) => pathname.startsWith(p))
  // Supabase stores the session in cookies named sb-<project>-auth-token (possibly chunked: ...-token.0).
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))

  // Anonymous visitors on public pages need nothing from Supabase. Skipping the client
  // here removes a network round trip from the time-to-first-byte of every such page.
  if (!isProtectedRoute && !hasSession) {
    return NextResponse.next()
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
      return NextResponse.redirect(new URL('/login', request.url))
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

// 4. الإعدادات (Matcher)
export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|manifest.json|sw.js|swe-worker|workbox-|offline.html|robots.txt|sitemap.xml|icons|opengraph-image).*)'],
}