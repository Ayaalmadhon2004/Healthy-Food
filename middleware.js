import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. القائمة البيضاء (White List): استثناء فوري وصارم
  // نضع هنا كل ما لا نريد للميدل وير أن يلمسه (API, Auth Pages, Static Files)
  if (
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/_next') || 
    pathname.includes('favicon.ico') ||
    pathname === '/signup' ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  // 2. إعداد الاستجابة (مرة واحدة فقط)
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 3. إعداد Supabase (للمسارات التي تحتاج حماية فقط)
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
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 4. جلب بيانات المستخدم
  // ملاحظة: getUser() تتحقق من التوكن، وبما أننا استثنينا /api/auth فلن تسبب مشاكل هناك
  const { data: { user } } = await supabase.auth.getUser()

  // 5. منطق الحماية (Protected Routes)
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/doctors')
  
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  // استثناء الملفات الثابتة لزيادة الأداء
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|manifest.json).*)'],
}