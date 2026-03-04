import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, recipeId } = await request.json();

    // التحقق من وجود البيانات
    if (!userId || !recipeId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // البحث عن المفضلة
    const existing = await prismaClient.favorite.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (existing) {
      // حذف إذا كانت موجودة
      await prismaClient.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ status: "removed" });
    } else {
      // إضافة إذا لم تكن موجودة
      await prismaClient.favorite.create({
        data: { userId, recipeId },
      });
      return NextResponse.json({ status: "added" });
    }
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ في السيرفر" }, { status: 500 });
  }
}