"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitAreaReportAction(formData) {
  const areaName = formData.get("areaName");
  const description = formData.get("description");
  const userId = formData.get("userId");

  console.log("1. Starting Action for user:", userId); // فحص الخطوة الأولى

  if (!prisma) throw new Error("Prisma client is not initialized");

  let success = false;

  try {
    await prisma.areaReport.create({
      data: {
        areaName,
        description,
        userId,
        status: "pending", 
      },
    });
    console.log("2. Database Save Success!"); // فحص نجاح الحفظ
    success = true;
  } catch (error) {
    console.error("Prisma Error:", error);
    return { error: "Failed to save to database" };
  }

  if (success) {
    revalidatePath("/dashboard");
    console.log("3. Redirecting now..."); // فحص التوجيه
    redirect("/dashboard?success=true");
  }
}

export async function getAllReportsAction() {
  try {
    const reports = await prisma.areaReport.findMany({
      orderBy: {
        createdAt: 'desc', 
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return { success: true, reports };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, error: "Failed to fetch reports" };
  }
}