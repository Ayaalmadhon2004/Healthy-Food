"use server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isOrgRole } from "@/lib/auth";
import { getServerMessages } from "@/lib/i18n";
import { getReservationTargetDate } from "@/lib/dates";
import { buildDashboardStats, type DashboardStats } from "@/lib/dashboardStats";

export async function getDashboardStatsAction(): Promise<
  { success: true; stats: DashboardStats } | { success: false; error: string }
> {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isOrgRole(sessionUser.role)) {
      return { success: false, error: (await getServerMessages()).unauthorized };
    }

    const [reserved, kitchens, areaReports] = await Promise.all([
      prisma.mealOrder.aggregate({
        where: { targetDate: getReservationTargetDate() },
        _sum: { quantity: true },
      }),
      prisma.kitchen.findMany({ select: { capacity: true } }),
      prisma.areaReport.count(),
    ]);

    return {
      success: true,
      stats: buildDashboardStats({
        reservedTomorrow: reserved._sum.quantity ?? 0,
        kitchenCapacities: kitchens.map((k) => k.capacity),
        areaReports,
      }),
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { success: false, error: (await getServerMessages()).reportsFetchFailed };
  }
}
