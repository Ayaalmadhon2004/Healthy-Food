"use server";
import { prisma } from "@/lib/prisma"; // تأكدي من المسار
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitAreaReportAction(formData) {
  const areaName = formData.get("areaName");
  const description = formData.get("description");
  const userId = formData.get("userId");

  // إضافة فحص بسيط للتأكد من وجود بريزما قبل التنفيذ
  if (!prisma) {
    throw new Error("Prisma client is not initialized");
  }

  try {
    await prisma.areaReport.create({
      data: {
        areaName: areaName,
        description: description,
        userId: userId,
        status: "pending", 
      },
    });
  } catch (error) {
    console.error("Prisma Error:", error);
    return { error: "Failed to save to database" };
  }

  revalidatePath("/reports");
  redirect("/reports");
}