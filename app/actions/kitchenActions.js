"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const REGION_MAP = {
  "North": { ar: "الشمال", en: "North" },
  "Gaza": { ar: "غزة", en: "Gaza" },
  "Middle": { ar: "الوسطى", en: "Middle" },
  "Khan Younis": { ar: "خانيونس", en: "Khan Younis" },
  "Rafah": { ar: "رفح", en: "Rafah" },
};

async function getIsAuthorized() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });

  return dbUser?.role === "ORG" || dbUser?.role === "ADMIN";
}

// 3. جلب المطابخ (مع Pagination)
export async function getKitchensAction(page = 1, limit = 5) {
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

    return {
      success: true,
      kitchens,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Fetch Kitchens Error:", error);
    return { success: false, error: "Failed to load kitchens" };
  }
}

// 4. إضافة مطبخ جديد
export async function addKitchenAction(formData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    const nameAr = formData.get("nameAr");
    const nameEn = formData.get("nameEn");
    const regionId = formData.get("regionId"); 
    
    const regionData = REGION_MAP[regionId] || { ar: "غير محدد", en: "Unspecified" };

    // منطق الترقيم التلقائي للأسماء المكررة
    const existingKitchens = await prisma.kitchen.findMany({
      where: {
        name: {
          path: ['ar'],
          string_starts_with: nameAr.trim(),
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
        todaysMeal: { ar: formData.get("mealAr"), en: formData.get("mealEn") },
        distributionTime: { ar: formData.get("timeAr"), en: formData.get("timeEn") },
        contact: formData.get("contact") || "No Contact",
        capacity: formData.get("capacity") || "0",
        accessInfo: { ar: "", en: "" },
      },
    });

    revalidatePath("/dashboard/organization");
    revalidatePath("/kitchens");
    return { success: true, kitchen: newKitchen };
  } catch (error) {
    console.error("Prisma Create Error:", error);
    return { success: false, error: error.message };
  }
}

// 5. تحديث مطبخ موجود
export async function updateKitchenAction(kitchenId, formData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    const regionId = formData.get("regionId");
    const regionData = REGION_MAP[regionId];

    const updatedData = {
      name: { ar: formData.get("nameAr"), en: formData.get("nameEn") },
      todaysMeal: { ar: formData.get("mealAr"), en: formData.get("mealEn") },
      distributionTime: { ar: formData.get("timeAr"), en: formData.get("timeEn") },
      contact: formData.get("contact") || "No Contact",
      capacity: formData.get("capacity") || "0",
    };

    if (regionData) {
      updatedData.region = { ar: regionData.ar, en: regionData.en };
    }

    const updatedKitchen = await prisma.kitchen.update({
      where: { id: Number(kitchenId) },
      data: updatedData
    });

    revalidatePath("/dashboard/organization");
    revalidatePath("/kitchens");
    return { success: true, kitchen: updatedKitchen };
  } catch (error) {
    console.error("Update Kitchen Error:", error);
    return { success: false, error: error.message };
  }
}

// 6. حذف مطبخ
export async function deleteKitchenAction(kitchenId) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    await prisma.kitchen.delete({
      where: { id: Number(kitchenId) }
    });

    revalidatePath("/dashboard/organization");
    revalidatePath("/kitchens");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete kitchen" };
  }
}

// 7. جلب السجلات (Food Logs)
export async function getKitchenByIdAction(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

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
      console.error("Fetch Logs Error:", error);
      return { success: false, error: "Failed to fetch logs" };
    }
}