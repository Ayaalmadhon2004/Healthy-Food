import { createSupabaseServerClient } from "@/lib/supabase/server"; // استبدل getSupabaseAdmin بهذا
import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    let { email, password } = await request.json();

    email = email?.trim().toLowerCase() || "";
    password = password?.trim() || "";

    if (!email || !password) {
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبة" }, { status: 400 });
    }

    // ✅ الحل هنا: نستخدم العميل العادي (Server Client) الذي يملك صلاحية إدارة الكوكيز
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ error: "خطأ في إعدادات السيرفر" }, { status: 500 });
    }

    // محاولة تسجيل الدخول - هنا سوبابيس سيقوم تلقائياً بإرسال الكوكيز للمتصفح
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    // جلب بيانات البروفايل من Prisma
    const user = await prismaClient.user.findUnique({
      where: { id: authData.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "لم يتم العثور على بروفايل المستخدم" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}