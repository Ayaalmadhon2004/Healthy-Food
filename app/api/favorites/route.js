import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, recipeId } = await request.json();

    if (!userId || !recipeId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // التحقق مما إذا كانت موجودة مسبقاً (لحذفها - Toggle)
    const existing = await prismaClient.favorite.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (existing) {
      // إذا كانت موجودة، نقوم بحذفها (Unfavorite)
      await prismaClient.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ message: "Removed from favorites", status: "removed" });
    } else {
      // إذا لم تكن موجودة، نقوم بإضافتها (Favorite)
      await prismaClient.favorite.create({
        data: { userId, recipeId },
      });
      return NextResponse.json({ message: "Added to favorites", status: "added" });
    }
  } catch (error) {
    console.error("Fav Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}