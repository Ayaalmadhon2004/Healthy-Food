"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * دالة داخلية للتحقق من صلاحية المستخدم
 */
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

/**
 * ✅ جلب المطابخ مع نظام التقسيم (Pagination)
 * تم دمج الدالتين هنا لمنع خطأ التكرار
 */
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

export async function addKitchenAction(formData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    const nameAr = formData.get("nameAr");
    const nameEn = formData.get("nameEn");

    // 1. البحث عن المطابخ التي تبدأ بنفس الاسم العربي
    // نستخدم "startsWith" لنتأكد من عدّ النسخ القديمة والجديدة
    const existingKitchens = await prisma.kitchen.findMany({
      where: {
        name: {
          path: ['ar'],
          string_startsWith: nameAr
        }
      }
    });

    let finalNameAr = nameAr;
    let finalNameEn = nameEn;

    // 2. إذا وجدنا تكرار، نحسب الرقم الجديد
    if (existingKitchens.length > 0) {
      const nextNumber = existingKitchens.length + 1;
      finalNameAr = `${nameAr} ${nextNumber}`;
      finalNameEn = `${nameEn} ${nextNumber}`;
    }

    const newKitchen = await prisma.kitchen.create({
      data: {
        name: { ar: finalNameAr, en: finalNameEn },
        region: { ar: formData.get("regionAr"), en: formData.get("regionEn") },
        location: { ar: formData.get("regionAr"), en: formData.get("regionEn") },
        todaysMeal: { ar: formData.get("mealAr"), en: formData.get("mealEn") },
        distributionTime: { ar: formData.get("timeAr"), en: formData.get("timeEn") },
        contact: formData.get("contact") || "No Contact",
        capacity: { 
            ar: formData.get("capacity") || "0", 
            en: formData.get("capacity") || "0" 
        },
        accessInfo: { ar: "", en: "" },
      },
    });

    revalidatePath("/dashboard/organization");
    return { success: true, kitchen: newKitchen };
  } catch (error) {
    console.error("Prisma Create Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateKitchenAction(kitchenId, formData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    const idAsNumber = Number(kitchenId);

    const updatedKitchen = await prisma.kitchen.update({
      where: { id: idAsNumber },
      data: {
        name: { ar: formData.get("nameAr"), en: formData.get("nameEn") },
        region: { ar: formData.get("regionAr"), en: formData.get("regionEn") },
        todaysMeal: { ar: formData.get("mealAr"), en: formData.get("mealEn") },
        distributionTime: { ar: formData.get("timeAr"), en: formData.get("timeEn") },
        contact: formData.get("contact") || "No Contact",
        capacity: { 
            ar: formData.get("capacity") || "0", 
            en: formData.get("capacity") || "0" 
        },
      }
    });
    revalidatePath("/dashboard/organization");
    return { success: true, kitchen: updatedKitchen };
  } catch (error) {
    console.error("Update Kitchen Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف مطبخ
 */
export async function deleteKitchenAction(kitchenId) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    await prisma.kitchen.delete({
      where: { id: Number(kitchenId) }
    });
    revalidatePath("/dashboard/organization");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete kitchen" };
  }
}