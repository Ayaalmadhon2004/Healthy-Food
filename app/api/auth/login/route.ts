// import { login } from "@/lib/auth-storage"
// import { cookies } from "next/headers"

// const users = [
//   {
//     id: "1",
//     name: "Abdullah ALLahham",
//     email: "abdullah@nutriflow.com",
//     password: "abdullah123",
//     phone: "",
//     dietaryPreferences: [],
//     healthGoals: [],
//   },
//   {
//     id: "2",
//     name: "Aya Almadhoon",
//     email: "aya@nutriflow.com",
//     password: "aya123",
//     phone: "",
//     dietaryPreferences: [],
//     healthGoals: [],
//   },
// ]



// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json()

//     if (!email || !password) {
//       return Response.json({ error: "Email and password required" }, { status: 400 })
//     }

//     const user = users.find((u) => u.email === email && u.password === password)

//     if (!user) {
//       return Response.json({ error: "Invalid email or password" }, { status: 401 })
//     }

//     const cookieStore = await cookies()
//     cookieStore.set("userId", user.id, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//     })
//     cookieStore.set("userName", user.name, {
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7,
//     })
//     cookieStore.set("userEmail", user.email, {
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7,
//     })

//     // localStorage.setItem("currentUser", JSON.stringify(user))

//     login( email, password );


//     return Response.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
//   } catch (error) {
//     return Response.json({ error: "Internal server error" }, { status: 500 })
//   }
// }








import { supabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    // 1️⃣ Authenticate user with Supabase Auth
    const { data: authData, error: authError } =
      await supabaseServer.auth.signInWithPassword({
        email,
        password,
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // 2️⃣ Fetch user profile from DB
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

    // 3️⃣ Return success (Supabase handles auth cookies)
    return NextResponse.json({
      success: true,
      user: profile,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
