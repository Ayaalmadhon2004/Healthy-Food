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
    const qty = Number(quantity);

    if (!userId) return { error: "يرجى تسجيل الدخول أولاً." };
    if (qty < 1) return { error: "يجب اختيار وجبة واحدة على الأقل." };

    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kId }
    });
    if (!kitchen) return { error: "المطبخ غير موجود." };

    const capValue = kitchen.capacity?.en || "500";
    const capacityLimit = parseInt(capValue.split('-').pop()) || 500;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const aggregation = await prisma.mealOrder.aggregate({
      where: { kitchenId: kId, targetDate: tomorrow },
      _sum: { quantity: true }
    });

    if (!kitchen) return { error: "المطبخ غير موجود" };
    const capacityLimit = parseInt(kitchen.capacity) || 0;

    if (currentTotal + qty > capacityLimit) {
      const remaining = capacityLimit - currentTotal;
      return { error: `عذراً، المتبقي فقط ${remaining} وجبة.` };
    }

    const existingOrder = await prisma.mealOrder.findFirst({
      where: { userId, kitchenId: kId, targetDate: tomorrow }
    });
    if (existingOrder) return { error: "لقد قمت بالحجز مسبقاً لهذا المطبخ لغدًا." };

    const newOrder = await prisma.mealOrder.create({
      data: {
        userId,
        kitchenId, 
        targetDate: tomorrow,
        quantity: qty 
      }
    });

    revalidatePath("/"); 
    return { success: `تم حجز ${qty} وجبات بنجاح لغدًا.` };

  } catch (error) {
    console.error("Meal Order Error:", error);
    return { error: `خطأ تقني: ${error.message}` };
  }
}