// import { signup } from "@/lib/auth-storage"
// import { NextResponse } from "next/server"

// export async function POST(request: Request) {
//   try {
//     const { name, email, password } = await request.json()

//     // Validate input
//     if (!name || !email || !password) {
//       return NextResponse.json({ error: "All fields are required" }, { status: 400 })
//     }

//     if (password.length < 6) {
//       return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
//     }

//     // Create user object
//     const user = {
//       id: Date.now().toString(),
//       name,
//       email,
//       phone: "",
//       dietaryPreferences: [],
//       healthGoals: [],
//       createdAt: new Date().toISOString(),
//     }
//     signup(name, email, password);

//     // Return success with user data (client will store in localStorage)
//     return NextResponse.json({ user }, { status: 201 })
//   } catch (error) {
//     return NextResponse.json({ error: "Signup failed" }, { status: 500 })
//   }
// }



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

    // 1️⃣ Create auth user
    const { data: auth, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
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
  } catch {
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    )
  }
}
