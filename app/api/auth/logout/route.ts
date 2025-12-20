// import { cookies } from "next/headers"

// export async function POST() {
//   try {
//     const cookieStore = await cookies()
//     cookieStore.delete("userId")
//     cookieStore.delete("userName")
//     cookieStore.delete("userEmail")

//     return Response.json({ success: true })
//   } catch (error) {
//     return Response.json({ error: "Internal server error" }, { status: 500 })
//   }
// }



import { supabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // تسجيل الخروج من Supabase (يحذف الجلسة والكوكيز تلقائياً)
    const { error } = await supabaseServer.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: "Logout failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
