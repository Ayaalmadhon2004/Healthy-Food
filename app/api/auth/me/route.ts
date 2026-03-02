import { getSupabaseServer } from "@/lib/supabase/server"
import { prismaClient } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabaseServer = await getSupabaseServer()

    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      )
    }

    // 1️⃣ الحصول على المستخدم الموثق حالياً من Supabase
    const { data: { user }, error: authError } =
      await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // 2️⃣ جلب بيانات المستخدم من Prisma مع إضافة حقل الـ role
    const profile = await prismaClient.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // ✅ أضفنا هذا الحقل لإصلاح مشكلة الـ Dashboard
        phone: true,
        dietary_preferences: true,
        health_goals: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    // 3️⃣ إرجاع بيانات المستخدم كاملة للمتصفح
    return NextResponse.json({
      user: profile,
    })
  } catch (error) {
    console.error("Get User Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}