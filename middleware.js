// middleware.js (أو proxy.js حسب طلب النظام لديك)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. إعداد Supabase Client (الطريقة الأحدث SSR)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 2. التحقق من الجلسة (Auth)
  const { data: { user } } = await supabase.auth.getUser()

  // 3. إدارة اللغة (Language)
  const lang = request.cookies.get('lang')?.value || 'ar'
  
  // تمرير اللغة عبر الـ Headers للسيرفر
  response.headers.set('x-custom-lang', lang)

  /*// 4. حماية المسارات (صفحة الأطباء)
  if (!user && request.nextUrl.pathname.startsWith('/doctors')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
    */

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)'],
}