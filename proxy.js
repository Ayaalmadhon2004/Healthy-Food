import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// تأكدي أن اسم الدالة هو "proxy" كما يطلب الخطأ
export async function proxy(request) {
  const { pathname } = request.nextUrl

  // 1. استثناء الملفات الثابتة لزيادة الأداء
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('favicon.ico') ||
    pathname.includes('manifest.json')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 2. تحديث الجلسة (هذا الجزء يمنع اختفاء "moh" بعد دقيقة)
  const { data: { user } } = await supabase.auth.getUser()

  // 3. حماية المسارات (Routes Protection)
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/doctors')
  
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// 4. الإعدادات (Matcher)
export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|manifest.json).*)'],
}