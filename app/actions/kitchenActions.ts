"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSessionUser, isOrgRole } from "@/lib/auth";
import { getCapacityLimit, validateCapacityInput } from "@/lib/capacity";
import { getReservationTargetDate } from "@/lib/dates";

const REGION_MAP: Record<string, { ar: string; en: string }> = {
  "North": { ar: "الشمال", en: "North" },
  "Gaza": { ar: "غزة", en: "Gaza" },
  "Middle": { ar: "الوسطى", en: "Middle" },
  "Khan Younis": { ar: "خانيونس", en: "Khan Younis" },
  "Rafah": { ar: "رفح", en: "Rafah" },
};

// Kitchen pages that must be refreshed after a change.
const KITCHEN_PATHS = ["/dashboard/organization", "/gaza-kitchen"];

async function getIsAuthorized(): Promise<boolean> {
  const user = await getSessionUser();
  return isOrgRole(user?.role);
}

// Text field from a form (empty string when missing or not text).
function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// 3. جلب المطابخ (مع Pagination)
export async function getKitchensAction(page: number = 1, limit: number = 5) {
  try {
    const skip = (page - 1) * limit;

    const [kitchens, totalCount] = await Promise.all([
      prisma.kitchen.findMany({
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
      }),
      prisma.kitchen.count()
    ]);

    // Meals already reserved for tomorrow and the numeric capacity, so the UI matches the server check.
    const reserved = await prisma.mealOrder.groupBy({
      by: ["kitchenId"],
      where: {
        kitchenId: { in: kitchens.map((k) => k.id) },
        targetDate: getReservationTargetDate(),
      },
      _sum: { quantity: true },
    });
    const reservedByKitchen = new Map(reserved.map((r) => [r.kitchenId, r._sum.quantity || 0]));

    return {
      success: true,
      kitchens: kitchens.map((k) => ({
        ...k,
        capacityLimit: getCapacityLimit(k.capacity),
        reservedTomorrow: reservedByKitchen.get(k.id) || 0,
      })),
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Fetch Kitchens Error:", error);
    return { success: false, error: "Failed to load kitchens" };
  }
}

// 4. إضافة مطبخ جديد
export async function addKitchenAction(formData: FormData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    const nameAr = field(formData, "nameAr");
    const nameEn = field(formData, "nameEn");
    if (!nameAr || !nameEn) return { success: false, error: "Name is required" };

    const regionData = REGION_MAP[field(formData, "regionId")] || { ar: "غير محدد", en: "Unspecified" };

    const capacity = validateCapacityInput(formData.get("capacity"));
    if (capacity === null) return { success: false, error: "Invalid capacity" };

    // منطق الترقيم التلقائي للأسماء المكررة
    const existingKitchens = await prisma.kitchen.findMany({
      where: {
        name: {
          path: ['ar'],
          string_starts_with: nameAr,
        }
      }
    });

    let finalNameAr = nameAr;
    let finalNameEn = nameEn;

    if (existingKitchens.length > 0) {
      const nextNumber = existingKitchens.length + 1;
      finalNameAr = `${nameAr} ${nextNumber}`;
      finalNameEn = `${nameEn} ${nextNumber}`;
    }

    const newKitchen = await prisma.kitchen.create({
      data: {
        name: { ar: finalNameAr, en: finalNameEn },
        region: { ar: regionData.ar, en: regionData.en },
        location: { ar: regionData.ar, en: regionData.en },
        todaysMeal: { ar: field(formData, "mealAr"), en: field(formData, "mealEn") },
        distributionTime: { ar: field(formData, "timeAr"), en: field(formData, "timeEn") },
        contact: field(formData, "contact") || "No Contact",
        capacity,
        accessInfo: { ar: "", en: "" },
      },
    });

    KITCHEN_PATHS.forEach((path) => revalidatePath(path));
    return { success: true, kitchen: newKitchen };
  } catch (error) {
    console.error("Prisma Create Error:", error);
    return { success: false, error: "Failed to save kitchen" };
  }
}

// 5. تحديث مطبخ موجود
export async function updateKitchenAction(kitchenId: number | string, formData: FormData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    const regionData = REGION_MAP[field(formData, "regionId")];

    const capacity = validateCapacityInput(formData.get("capacity"));
    if (capacity === null) return { success: false, error: "Invalid capacity" };

    const nameAr = field(formData, "nameAr");
    const nameEn = field(formData, "nameEn");
    if (!nameAr || !nameEn) return { success: false, error: "Name is required" };

    const updatedData: Prisma.KitchenUpdateInput = {
      name: { ar: nameAr, en: nameEn },
      todaysMeal: { ar: field(formData, "mealAr"), en: field(formData, "mealEn") },
      distributionTime: { ar: field(formData, "timeAr"), en: field(formData, "timeEn") },
      contact: field(formData, "contact") || "No Contact",
      capacity,
    };

    if (regionData) {
      updatedData.region = { ar: regionData.ar, en: regionData.en };
    }

    const updatedKitchen = await prisma.kitchen.update({
      where: { id: Number(kitchenId) },
      data: updatedData
    });

    KITCHEN_PATHS.forEach((path) => revalidatePath(path));
    return { success: true, kitchen: updatedKitchen };
  } catch (error) {
    console.error("Update Kitchen Error:", error);
    return { success: false, error: "Failed to save kitchen" };
  }
}

// 6. حذف مطبخ
export async function deleteKitchenAction(kitchenId: number | string) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    await prisma.kitchen.delete({
      where: { id: Number(kitchenId) }
    });

    KITCHEN_PATHS.forEach((path) => revalidatePath(path));
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete kitchen" };
  }
}
