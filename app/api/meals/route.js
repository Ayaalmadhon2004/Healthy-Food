// import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET() {
  const supabase = supabaseServer;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("meals")
    .select("id, meal_name, meal_type, calories")
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ meals: data })
}

export async function POST(req) {
  const supabase = supabaseServer;
  const body = await req.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("meals").insert({
    user_id: user.id,
    meal_name: body.mealName,
    meal_type: body.option,
    calories: body.calories,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req) {
  const supabase = supabaseServer;
  const { id } = await req.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await supabase.from("meals").delete().eq("id", id)

  return NextResponse.json({ success: true })
}
