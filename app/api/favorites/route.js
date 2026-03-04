import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    // جلب المفضلات مع بيانات الوصفة
    const favorites = await prisma.favorite.findMany({
      where: { userId },
    });

    // تحويل البيانات لشكل يفهمه المتجر
    const formatted = favorites.map(f => {
      // التأكد من أن recipeData كائن وليس نصاً
      const recipeData = typeof f.recipeData === 'string' 
        ? JSON.parse(f.recipeData) 
        : (f.recipeData || {});
        
      return {
        ...recipeData,
        id: f.recipeId // استخدام الـ Int ID
      };
    });

    return NextResponse.json({ favorites: formatted }, { status: 200 });

  } catch (error) {
    console.error("GET Error:", error.message);
    // إرجاع مصفوفة فارغة بدلاً من رد فارغ لتجنب خطأ SyntaxError
    return NextResponse.json({ favorites: [], error: error.message }, { status: 200 });
  }
}
export async function POST(request) {
  try {
    const { userId, recipeId, mealData } = await request.json();
    const rId = Number(recipeId);

    if (!userId || isNaN(rId)) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    // 1. التأكد من وجود المستخدم في جدول User الخاص بـ Prisma
    // ملاحظة: Prisma لن تسمح بإضافة مفضلة لمستخدم لا يملك سجلاً في جدول User
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      console.error("❌ User not found in database:", userId);
      return NextResponse.json({ 
        error: "User record missing", 
        details: "المستخدم مسجل في Auth ولكن ليس له سجل في جدول User الخاص بـ Prisma" 
      }, { status: 404 });
    }

    // 2. التأكد من وجود الوصفة في جدول FoodRecipe
    // Prisma لن تسمح بإضافة Favorite لوصفة غير موجودة في جدولها الأصلي (Foreign Key Constraint)
    let recipe = await prisma.foodRecipe.findUnique({ where: { id: rId } });

    if (!recipe) {
      console.log("Creating missing recipe in DB to satisfy relation...");
      recipe = await prisma.foodRecipe.create({
        data: {
          id: rId,
          img: mealData.img || "",
          title: mealData.title || {}, 
          type: mealData.type || {},
          time: mealData.time || {},
          cal: mealData.cal || {},
          nutrition: mealData.nutrition || {},
          ingredients: mealData.ingredients || {},
          instructions: mealData.instructions || {},
        }
      });
    }

    // 3. التبديل بين الإضافة والحذف (Toggle)
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: { userId, recipeId: rId }
      }
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      return NextResponse.json({ message: "Removed" });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          recipeId: rId,
          recipeData: mealData
        }
      });
      return NextResponse.json({ message: "Added" });
    }

  } catch (error) {
    console.error("Detailed Server Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}