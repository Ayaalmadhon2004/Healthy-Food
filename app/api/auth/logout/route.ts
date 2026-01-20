import { getSupabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseServer = await getSupabaseServer()

    // Check server connection
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Internal server configuration error" },
        { status: 500 }
      )
    }

    // Sign out from Supabase (automatically clears session & cookies)
    const { error } = await supabaseServer.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: "Logout failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout Error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}