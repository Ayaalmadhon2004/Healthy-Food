import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // 🛡️ التحقق من اتصال Supabase (لحل خطأ Type Error)
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      );
    }

    // 1️⃣ Authenticate user with Supabase Auth
    const { data: authData, error: authError } =
      await supabaseServer.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2️⃣ Fetch user profile from DB
    const { data: profile, error: profileError } =
      await supabaseServer
        .from("users")
        .select("id, name, email")
        .eq("id", authData.user.id)
        .single();

    if (profileError) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Return success (Supabase handles auth cookies)
    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}