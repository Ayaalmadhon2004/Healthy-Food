import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { User as UserData } from "@/hooks/useUserData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { email, password } = validation.data;
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ error: "Authentication service unavailable" }, { status: 500 });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email, 
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    let userData: UserData | null = null;
    let formattedFavorites: Record<string, unknown>[] = [];

    try {
      const user = await prisma.user.findUnique({
        where: { id: authData.user.id },
        include: { favorites: true }
      });

      if (user) {
        userData = {
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          role: user.role as UserData["role"]
        };
        
        // ✅ تم إصلاح تعريف data هنا بإضافة : unknown
        formattedFavorites = user.favorites
          .map((f: { recipeData: unknown }) => f.recipeData)
          .filter((data: unknown): data is Record<string, unknown> => 
            data !== null && typeof data === 'object'
          );
      }
    } catch (prismaError) {
      console.error("Prisma Fetch Error:", prismaError);
      userData = { 
        id: authData.user.id, 
        email: authData.user.email ?? "", 
        name: "", 
        role: "USER" 
      };
    }

    if (!userData) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: userData, 
      favorites: formattedFavorites 
    }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}