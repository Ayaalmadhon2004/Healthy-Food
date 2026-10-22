"use server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isOrgRole } from "@/lib/auth";
import { getServerMessages } from "@/lib/i18n";
import { getGazaDateParts, getReservationTargetDate } from "@/lib/dates";
import type { DoctorStats } from "@/lib/appointments";
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

export async function getDoctorStatsAction(): Promise<
  { success: true; stats: DoctorStats } | { success: false; error: string }
> {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "DOCTOR") {
      return { success: false, error: (await getServerMessages()).unauthorized };
    }
    const doctor = await prisma.doctor.findUnique({ where: { userId: sessionUser.id }, select: { id: true } });
    if (!doctor) return { success: true, stats: { patients: 0, upcoming: 0, pending: 0 } };

    const { year, month, day } = getGazaDateParts();
    const [patients, upcoming, pending] = await Promise.all([
      prisma.appointment.groupBy({ by: ["patientId"], where: { doctorId: doctor.id, status: { not: "CANCELLED" } } }),
      prisma.appointment.count({
        where: { doctorId: doctor.id, status: "CONFIRMED", preferredDate: { gte: new Date(Date.UTC(year, month - 1, day)) } },
      }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: "PENDING" } }),
    ]);
    return { success: true, stats: { patients: patients.length, upcoming, pending } };
  } catch (error) {
    console.error("Doctor stats error:", error);
    return { success: false, error: (await getServerMessages()).somethingWrong };
  }
}
