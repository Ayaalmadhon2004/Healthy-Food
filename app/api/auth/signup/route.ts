import { getSupabaseAdmin } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerMessages } from "@/lib/i18n";
import { rateLimit, getClientIp } from "@/lib/rateLimit"
import { createSignupSchema } from "@/lib/validations/auth"

export async function POST(req: Request) {
  const m = await getServerMessages();
  const limited = await rateLimit(`signup:${getClientIp(req)}`, { limit: 5, windowMs: 600000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: m.tooManyAttempts },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const body = await req.json()

    const validation = createSignupSchema(m).safeParse(body)

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      
      const fieldErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(errors)) {
        if (messages?.[0]) {
          fieldErrors[key] = messages[0];
        }
      }

      return NextResponse.json(
        { error: m.validationFailed, fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: m.emailRegistered },
        { status: 409 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      console.error("Supabase Admin Keys are missing in .env");
      return NextResponse.json(
        { error: m.serverConfigError },
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
        { error: authError?.message || m.authProviderError },
        { status: 400 }
      );
    }

    try {
      const user = await prisma.user.create({
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
      console.error("Prisma DB Error:", prismaError)
      return NextResponse.json(
        { error: m.databaseError },
        { status: 500 }
      );
    }
    
  } catch (error: unknown) {
    console.error("Global Signup API Error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: m.signupFailed },
      { status: 500 }
    );
  }
}