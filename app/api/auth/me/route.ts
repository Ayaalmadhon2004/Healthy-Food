import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, recipeId } = await request.json();

    if (!userId || !recipeId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ status: "removed" }); 
    } else {
      await prisma.favorite.create({
        data: { userId, recipeId },
      });
      return NextResponse.json({ status: "added" });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في السيرفر";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// أضيفي هذا تحت دالة POST في نفس الملف
export async function GET() {
  return NextResponse.json({ message: "هذا المسار مخصص للمفضلات فقط عبر POST" }, { status: 200 });
}