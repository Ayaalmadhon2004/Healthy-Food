"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. إضافة وجبة
export async function addMealAction(data) {
  try {
    const meal = await prisma.meal.create({
      data: {
        userId: data.userId,
        mealType: data.mealType,
        foodName: data.foodName,
        calories: parseInt(data.calories),
      }
    });

    revalidatePath("/dashboard/tracker");
    revalidatePath("/dashboard"); 

    return { success: true, meal };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. 🔥 تعديل دالة getMealsAction لتجلب وجبات اليوم فقط (هذا هو سبب المشكلة)
export async function getMealsAction(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const meals = await prisma.meal.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: today, 
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, meals };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 3. حذف وجبة
export async function deleteMealAction(mealId) {
  try {
    await prisma.meal.delete({
      where: { id: mealId },
    });
    revalidatePath("/dashboard/tracker");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 4. جلب بيانات الشبكة (المربعات)
export async function getMonthlyGridDataAction(userId, year, month) {
  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const meals = await prisma.meal.findMany({
      where: {
        userId: userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { calories: true, createdAt: true }
    });

    const dailyTotals = {};
    meals.forEach(meal => {
      const day = new Date(meal.createdAt).getUTCDate(); 
      dailyTotals[day] = (dailyTotals[day] || 0) + meal.calories;
    });

    return { success: true, dailyTotals };
  } catch (error) {
    return { success: false, dailyTotals: {} };
  }
}

// 5. جلب الإحصائيات (الأرقام الثلاثة)
export async function getMonthlyStatsAction(userId, year, month) {
  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const meals = await prisma.meal.findMany({
      where: { userId, createdAt: { gte: startDate, lte: endDate } },
    });

    const dailyTotals = {};
    meals.forEach(meal => {
      const day = new Date(meal.createdAt).getUTCDate();
      dailyTotals[day] = (dailyTotals[day] || 0) + meal.calories;
    });

    const totalsArray = Object.values(dailyTotals);
    const avgCalories = totalsArray.length > 0 
      ? Math.round(totalsArray.reduce((a, b) => a + b, 0) / totalsArray.length) 
      : 0;
    
    // أيام الالتزام (أقل من 2000 سعرة)
    const commitmentDays = totalsArray.filter(v => v <= 2000 && v > 0).length;

    return { 
      success: true, 
      stats: { 
        avgCalories, 
        commitmentDays, 
        totalMeals: meals.length 
      } 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function reserveMealAction(userId, kitchenId) {
  try {
    const kId = Number(kitchenId);
    
    // 1. التأكد من أن userId ليس فارغاً
    if (!userId) {
      return { error: "يرجى تسجيل الدخول أولاً للقيام بالحجز." };
    }

    // 2. 🔥 التأكد من أن المستخدم موجود فعلاً في قاعدة البيانات (لتجنب Foreign Key Error)
    const userInDb = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userInDb) {
      return { error: "لم يتم العثور على حسابك في قاعدة البيانات. يرجى تسجيل الخروج والدخول مجدداً." };
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // 3. التحقق من وجود حجز مسبق (لتجنب Duplicate Error)
    const existing = await prisma.mealOrder.findUnique({
      where: {
        userId_kitchenId_targetDate: {
          userId: userId,
          kitchenId: kId,
          targetDate: tomorrow
        }
      }
    });

    if (existing) {
      return { error: "لقد قمت بحجز وجبة في هذا المطبخ لغدًا بالفعل." };
    }

    // 4. تنفيذ الحجز
    const newOrder = await prisma.mealOrder.create({
      data: {
        userId: userId,
        kitchenId: kId,
        targetDate: tomorrow,
      },
    });

    revalidatePath("/");
    return { success: "تم حجز وجبتك لغداً بنجاح! 🥘" };

  } catch (error) {
    console.error("❌ Prisma Action Error:", error.message);
    return { error: `خطأ في العملية: ${error.message}` };
  }
}