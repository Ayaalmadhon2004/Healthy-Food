"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser, isOrgRole } from "@/lib/auth";
import { getServerMessages } from "@/lib/i18n";

export async function submitAreaReportAction(formData: FormData): Promise<{ error: string } | undefined> {
  const areaName = formData.get("areaName");
  const description = formData.get("description");

  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: (await getServerMessages()).unauthorized };
  const userId = sessionUser.id;

  if (typeof areaName !== "string" || typeof description !== "string" ||
      !areaName.trim() || !description.trim() ||
      areaName.length > 200 || description.length > 2000) {
    return { error: (await getServerMessages()).invalidData };
  }

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
    success = true;
  } catch (error) {
    console.error("Prisma Error:", error);
    return { error: (await getServerMessages()).reportSaveFailed };
  }

  if (success) {
    revalidatePath("/dashboard");
    redirect("/dashboard?success=true");
  }
}

export async function getAllReportsAction() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isOrgRole(sessionUser.role)) {
      return { success: false, error: (await getServerMessages()).unauthorized };
    }

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
    return { success: false, error: (await getServerMessages()).reportsFetchFailed };
  }
}