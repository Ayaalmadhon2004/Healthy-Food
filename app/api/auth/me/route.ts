import { supabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      );
    }

    // 1️⃣ Get currently authenticated user from Supabase
    const { data: authData, error: authError } =
      await supabaseServer.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // 2️⃣ Fetch user profile from your users table
    const { data: profile, error: profileError } =
      await supabaseServer
        .from("users")
        .select("id, name, email")
        .eq("id", authData.user.id)
        .single()

    if (profileError) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    // 3️⃣ Return current user
    return NextResponse.json({
      user: profile,
    })
  } catch (error) {
    console.error("Get User Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}