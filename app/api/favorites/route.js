import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// what is the difference of use both get and post ? , and where 
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
    });

    const formatted = favorites.map(f => {
      const recipeData = typeof f.recipeData === 'string' 
        ? JSON.parse(f.recipeData) 
        : (f.recipeData || {}); // what these 3 lines means ?
        
      return {
        ...recipeData,
        id: f.recipeId 
      };
    });

    return NextResponse.json({ favorites: formatted }, { status: 200 });

  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ favorites: [], error: error.message }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const { userId, recipeId, mealData } = await request.json(); // these 3 from where ? or the request from where ? 
    const rId = Number(recipeId);

    if (!userId || isNaN(rId)) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 }); // where this will appear 
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json({ 
        error: "User record missing", 
        details: "المستخدم مسجل في Auth ولكن ليس له سجل في جدول User الخاص بـ Prisma" 
      }, { status: 404 });
    }

    let recipe = await prisma.foodRecipe.findUnique({ where: { id: rId } });

    if (!recipe) {
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
      }); // why here we add a new recipe , we must just add a recipe already exist in fav , but why this is like this ?
    }

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}