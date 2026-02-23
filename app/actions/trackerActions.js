"use server";
import prisma from "@/lib/prisma"; // تأكدي من مسار ملف البريزما عندك

export async function getUserMonthlyLogsAction(userId, year, month) {
  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1,0,0,0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59,999));

    const logs = await prisma.foodLog.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Error fetching logs:", error);
    return { success: false, error: "Failed to fetch logs" };
  }
}