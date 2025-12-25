import { supabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // 🛡️ التحقق من الاتصال لإرضاء TypeScript وتجنب أخطاء الـ Build
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      )
    }

    // 1️⃣ Create auth user
    const { data: auth, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError || !auth.user) {
      return NextResponse.json(
        { error: authError?.message || "Auth creation failed" },
        { status: 400 }
      )
    }

    // 2️⃣ Insert user profile
    const { error: profileError } =
      await supabaseServer.from("users").insert({
        id: auth.user.id,
        name,
        email,
        phone: "",
        dietary_preferences: [],
        health_goals: [],
      })

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    )
  }
}