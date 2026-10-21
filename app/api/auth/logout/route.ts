import { getSupabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerMessages } from "@/lib/i18n"

export async function POST() {
  const m = await getServerMessages()
  try {
    const supabaseServer = await getSupabaseServer()

    // Check server connection
    if (!supabaseServer) {
      return NextResponse.json(
        { error: m.internalConfigError },
        { status: 500 }
      )
    }

    // Sign out from Supabase (automatically clears session & cookies)
    const { error } = await supabaseServer.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: m.logoutFailed },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout Error:", error)
    return NextResponse.json(
      { error: m.unexpectedError },
      { status: 500 }
    )
  }
}