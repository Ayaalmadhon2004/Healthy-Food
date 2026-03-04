import { prisma } from "@/lib/prisma"; // ✅ تأكدي من استخدام prisma الموحد
import { NextResponse } from "next/server";

// ✅ إضافة النوع Request للمتغير لتجاوز خطأ 'implicitly has an any type'
export async function POST(request: Request) {
  try {
    const { userId, recipeId } = await request.json();

    // التحقق من وجود البيانات
    if (!userId || !recipeId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // ✅ استخدام prisma بدلاً من prismaClient المذكور في الكود القديم
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: { userId, recipeId },
      },
    });

    if (existing) {
      // حذف إذا كانت موجودة
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ status: "removed" });
    } else {
      // إضافة إذا لم تكن موجودة
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