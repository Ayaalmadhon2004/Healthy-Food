import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// recipeData is stored as JSON; older rows may hold it as a JSON string.
function parseRecipeData(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

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

    const formatted = favorites.map((f) => ({
      ...parseRecipeData(f.recipeData),
      id: f.recipeId,
    }));

    return NextResponse.json({ favorites: formatted }, { status: 200 });

  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ favorites: [], error: "Failed to load favorites" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionUser.id;

    const body: { recipeId?: unknown } | null = await request.json().catch(() => null);
    const { recipeId } = body ?? {};
    const rId = Number(recipeId);

    if (!Number.isInteger(rId)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Only recipes that already exist in the database can be favorited;
    // clients can no longer create recipes through this endpoint.
    const recipe = await prisma.foodRecipe.findUnique({ where: { id: rId } });
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
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
          // Stored from the trusted DB record, not from client input.
          recipeData: {
            img: recipe.img,
            title: recipe.title,
            type: recipe.type,
            time: recipe.time,
            cal: recipe.cal,
            nutrition: recipe.nutrition,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
          }
        }
      });
      return NextResponse.json({ message: "Added" });
    }

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to update favorites" }, { status: 500 });
  }
}