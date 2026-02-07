import { getSupabaseAdmin } from "@/lib/supabase/server"
import { prismaClient } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { signupSchema } from "@/lib/validations/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validation = signupSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      
      const fieldErrors: Record<string, string> = {};
      for (const key in errors) {
        if (errors[key]) {
          fieldErrors[key] = errors[key]![0]; // نأخذ أول رسالة خطأ لكل حقل
        }
      }

      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data

    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      console.error("🚨 Supabase Admin Keys are missing in .env");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { data: auth, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError || !auth.user) {
      return NextResponse.json(
        { error: authError?.message || "Auth provider error" },
        { status: 400 }
      );
    }

    try {
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

      return NextResponse.json(
        {
          success: true,
          user: { id: user.id, name: user.name, email: user.email },
        },
        { status: 201 }
      );
    } catch (prismaError) {
      await supabaseAdmin.auth.admin.deleteUser(auth.user.id)
      console.error("🚨 Prisma DB Error:", prismaError)
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("🚨 Global Signup API Error:", error.message)
    return NextResponse.json(
      { error: "Something went wrong on our end" },
      { status: 500 }
    );
  }
}