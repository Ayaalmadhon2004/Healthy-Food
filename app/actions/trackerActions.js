"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getGazaMonthRange } from "@/lib/dates";

export async function getUserMonthlyLogsAction(_userId, year, month) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: "Unauthorized" };
    const userId = sessionUser.id;

    const { start: startDate, end: endDate } = getGazaMonthRange(year, month);

    const logs = await prisma.foodLog.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lt: endDate,
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