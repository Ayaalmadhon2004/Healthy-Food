import { getSupabaseServer } from "@/lib/supabase/server";
import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    let { email, password } = await request.json();

    // 1️⃣ Trim and normalize inputs
    email = email?.trim().toLowerCase() || "";
    password = password?.trim() || "";

    // 2️⃣ Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 3️⃣ Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabaseServer = await getSupabaseServer();

    // 4️⃣ Check Supabase server connection
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      );
    }

    // 5️⃣ Authenticate user with Supabase Auth
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

    // 6️⃣ Fetch user profile from database using Prisma
    const user = await prismaClient.user.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dietary_preferences: true,
        health_goals: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // 7️⃣ Return success with user data
    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}