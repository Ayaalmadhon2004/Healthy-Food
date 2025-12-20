// import { cookies } from "next/headers"

// export async function GET() {
//   try {
//     const cookieStore = await cookies()
//     const userId = cookieStore.get("userId")?.value
//     const userName = cookieStore.get("userName")?.value
//     const userEmail = cookieStore.get("userEmail")?.value

//     if (!userId) {
//       return Response.json({ error: "Not authenticated" }, { status: 401 })
//     }

//     return Response.json({
//       user: {
//         id: userId,
//         name: userName,
//         email: userEmail,
//       },
//     })
//   } catch (error) {
//     return Response.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


import { supabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
