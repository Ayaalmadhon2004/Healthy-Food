import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { User as UserData } from "@/hooks/useUserData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const { email, password } = validation.data;
    const supabase = await createSupabaseServerClient();

    // فحص الأمان لتجنب خطأ 'possibly null' في Vercel
    if (!supabase) {
      return NextResponse.json({ error: "خدمة الاتصال بـ Supabase غير متوفرة" }, { status: 500 });
    }

    // 1. تسجيل الدخول
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    // 2. جلب البيانات من Prisma باستخدام الواجهة المستوردة
    let userData: UserData | null = null;
    let formattedFavorites: object[] = [];

    try {
      const user = await prisma.user.findUnique({
        where: { id: authData.user.id },
        include: { favorites: true }
      });

      if (user) {
        // تأكدي أن الحقول هنا تطابق تعريف UserData في الـ hook الخاص بكِ
        userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as any // استخدام as any هنا فقط إذا كان هناك اختلاف بسيط في تعريف الـ Role
        };
        
        formattedFavorites = user.favorites
          .map(f => f.recipeData)
          .filter((data): data is object => data !== null);
      }
    } catch (prismaError) {
      console.error("Prisma Error:", prismaError);
      // Fallback بسيط إذا فشل Prisma
      userData = { id: authData.user.id, email: authData.user.email, name: "", role: "USER" } as UserData;
    }

    if (!userData) {
      return NextResponse.json({ error: "لم يتم العثور على ملف المستخدم" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: userData, 
      favorites: formattedFavorites 
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}