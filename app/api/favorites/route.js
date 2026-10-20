import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    // The user is always taken from the session, never from the query string.
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }
    const userId = sessionUser.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
    });

    const formatted = favorites.map(f => {
      const recipeData = typeof f.recipeData === 'string' 
        ? JSON.parse(f.recipeData) 
        : (f.recipeData || {});
        
      return {
        ...recipeData,
        id: f.recipeId 
      };
    });

    return NextResponse.json({ favorites: formatted }, { status: 200 });

  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ favorites: [], error: "Failed to load favorites" }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionUser.id;

    const { recipeId, mealData } = await request.json();
    const rId = Number(recipeId);

    if (!Number.isInteger(rId) || !mealData || typeof mealData !== "object") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
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
      }); 
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
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to update favorites" }, { status: 500 });
  }
}