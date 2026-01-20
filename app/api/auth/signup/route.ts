import { supabaseServer } from "@/lib/supabase/server"
import { prismaClient } from "@/lib/prisma"
import { NextResponse } from "next/server"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    let { name, email, password } = await req.json()

    // 1️⃣ Trim inputs
    name = name?.trim() || ""
    email = email?.trim().toLowerCase() || ""
    password = password?.trim() || ""

    // 2️⃣ Validate all fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // 3️⃣ Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // 4️⃣ Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      )
    }

    // 5️⃣ Check if user exists in database
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // 6️⃣ Create auth user in Supabase
    const { data: auth, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError || !auth.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create account" },
        { status: 400 }
      )
    }

    // 7️⃣ Create user profile in database
    const user = await prismaClient.user.create({
      data: {
        id: auth.user.id,
        name,
        email,
        phone: "",
        dietary_preferences: [],
        health_goals: [],
      },
    })

    if (!user) {
      // Cleanup: Delete auth user if profile creation fails
      await supabaseServer.auth.admin.deleteUser(auth.user.id)
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      )
    }

    // 8️⃣ Return success with user data
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup Error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}