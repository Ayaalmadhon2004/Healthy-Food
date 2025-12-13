import { signup } from "@/lib/auth-storage"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Create user object
    const user = {
      id: Date.now().toString(),
      name,
      email,
      phone: "",
      dietaryPreferences: [],
      healthGoals: [],
      createdAt: new Date().toISOString(),
    }
    signup(name, email, password);

    // Return success with user data (client will store in localStorage)
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
