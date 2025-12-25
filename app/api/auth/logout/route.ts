import { supabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // 🛡️ تحقق الأمان لإرضاء TypeScript ومنع خطأ الـ Build
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Supabase server is not initialized" },
        { status: 500 }
      );
    }

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
    console.error("Logout Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}