"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server"; // استخدمي الملف الذي أنشأناه سابقاً
import { revalidatePath } from "next/cache";

/**
 * دالة داخلية للتحقق من صلاحية المستخدم (سيرفر فقط)
 */
async function getIsAuthorized() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });

  return dbUser?.role === "ORG" || dbUser?.role === "ADMIN";
}

/**
 * جلب جميع المطابخ
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
 * إضافة مطبخ جديد (لدعم الزر الذي أنشأناه سابقاً)
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
        status: "ACTIVE",
      },
    });

    revalidatePath("/organization");
    return { success: true, kitchen: newKitchen };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * تحديث بيانات المطبخ (التعديل)
 */
export async function updateKitchenAction(kitchenId, formData) {
  try {
    const isAuthorized = await getIsAuthorized();
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized access" };
    }

    // التحويل إلى رقم ليتوافق مع Prisma (Int)
    const idAsNumber = Number(kitchenId);

    const updatedKitchen = await prisma.kitchen.update({
      where: { id: idAsNumber },
      data: {
        // نحدث القيم بناءً على هيكل الـ JSON الثنائي اللغة
        todaysMeal: { 
          ar: formData.get("mealAr"), 
          en: formData.get("mealEn") 
        },
        distributionTime: { 
          ar: formData.get("timeAr"), 
          en: formData.get("timeEn") 
        },
        // إذا كان هناك حقول أخرى مثل الاسم والمنطقة يمكن إضافتها هنا
        name: {
          ar: formData.get("nameAr"),
          en: formData.get("nameEn")
        },
        region: {
          ar: formData.get("regionAr"),
          en: formData.get("regionEn")
        }
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