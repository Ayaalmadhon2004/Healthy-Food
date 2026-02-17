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
 * ✅ جلب جميع المطابخ (هذه الدالة التي كانت تنقصك)
 */
export async function getKitchensAction() {
  try {
    const kitchens = await prisma.kitchen.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, kitchens };
  } catch (error) {
    console.error("Fetch Kitchens Error:", error);
    return { success: false, error: "Failed to load kitchens" };
  }
}

/**
 * إضافة مطبخ جديد
 */
export async function addKitchenAction(formData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) return { success: false, error: "Unauthorized" };

    const newKitchen = await prisma.kitchen.create({
      data: {
        name: { ar: formData.get("nameAr"), en: formData.get("nameEn") },
        region: { ar: formData.get("regionAr"), en: formData.get("regionEn") },
        location: { ar: formData.get("regionAr"), en: formData.get("regionEn") },
        todaysMeal: { ar: formData.get("mealAr"), en: formData.get("mealEn") },
        distributionTime: { ar: formData.get("timeAr"), en: formData.get("timeEn") },
        
        // حقول إجبارية بناءً على Schema.prisma
        contact: formData.get("contact") || "No Contact",
        capacity: { 
            ar: formData.get("capacity") || "0", 
            en: formData.get("capacity") || "0" 
        },
        accessInfo: { ar: "", en: "" },
      },
    });

    revalidatePath("/organization");
    return { success: true, kitchen: newKitchen };
  } catch (error) {
    console.error("Prisma Create Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * تحديث بيانات المطبخ
 */
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

    revalidatePath("/organization");
    revalidatePath(`/organization/${kitchenId}/edit`);
    
    return { success: true, kitchen: updatedKitchen };
  } catch (error) {
    console.error("Update Kitchen Error:", error);
    return { success: false, error: error.message };
  }
}