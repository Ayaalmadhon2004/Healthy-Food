import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. جلب المفضلات (GET)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ favorites: [] }, { status: 400 });

  try {
    const favorites = await prismaClient.favorite.findMany({
      where: { userId },
      select: { recipeData: true } // نأخذ فقط بيانات الوصفة
    });

    // تنسيق البيانات لتكون مصفوفة وجبات مباشرة
    const formatted = favorites.map(f => f.recipeData);
    return NextResponse.json({ favorites: formatted });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// 2. إضافة أو حذف مفضلة (POST)
export async function POST(request) {
  try {
    const { userId, recipeId, mealData } = await request.json();

    if (!userId || !recipeId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // التحقق هل الوجبة موجودة مسبقاً؟
    const existing = await prismaClient.favorite.findFirst({
      where: { userId, recipeId }
    });

    if (existing) {
      // إذا كانت موجودة -> نحذفها (Toggle Off)
      await prismaClient.favorite.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ message: "Removed" });
    } else {
      // إذا لم تكن موجودة -> نضيفها (Toggle On)
      await prismaClient.favorite.create({
        data: {
          userId,
          recipeId,
          recipeData: mealData // تخزين كائن الوجبة بالكامل كـ JSON
        }
      });
      return NextResponse.json({ message: "Added" });
    }
  } catch (error) {
    console.error("Favorite API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}