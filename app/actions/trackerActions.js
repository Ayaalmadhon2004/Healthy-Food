"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function getUserMonthlyLogsAction(_userId, year, month) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: "Unauthorized" };
    const userId = sessionUser.id;

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

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

    return { success: true, logs: JSON.parse(JSON.stringify(logs)) };
  } catch (error) {
    console.error("Action Error:", error);
    return { success: false, error: "Failed to fetch logs" };
  }
}