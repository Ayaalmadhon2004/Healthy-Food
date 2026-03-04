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
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { email, password } = validation.data;
    const supabase = await createSupabaseServerClient();

    // 1. تسجيل الدخول في Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email, password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 2. جلب بيانات المستخدم مع المفضلات - باستخدام TRY داخلية لضمان عدم الانهيار
    let userData = null;
    let formattedFavorites = [];

    try {
      const user = await prismaClient.user.findUnique({
        where: { id: authData.user.id },
        include: { favorites: true } // جلب المفضلات ببساطة
      });

      if (user) {
        userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
        // تحويل المفضلات بأمان
        formattedFavorites = (user.favorites || [])
          .map((f: any) => f.recipeData)
          .filter(Boolean);
      }
    } catch (prismaError) {
      console.error("Prisma Fetch Error:", prismaError);
      // إذا فشل Prisma، نكتفي ببيانات Supabase الأساسية لكي لا يتوقف التسجيل
      userData = { id: authData.user.id, email: authData.user.email };
    }

    if (!userData) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: userData, 
      favorites: formattedFavorites 
    }, { status: 200 });

  } catch (error: any) {
    console.error("CRITICAL LOGIN ERROR:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}