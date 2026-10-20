"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { getGazaDayOfMonth, getGazaMonthRange, getGazaTodayStart, getReservationTargetDate } from "@/lib/dates";
import { getCapacityLimit } from "@/lib/capacity";

export async function addMealAction(data) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: "Unauthorized" };

    const meal = await prisma.meal.create({
      data: {
        userId: sessionUser.id,
        mealType: data.mealType,
        foodName: data.foodName,
        calories: parseInt(data.calories),
      }
    });

    revalidatePath("/dashboard/tracker");
    revalidatePath("/dashboard"); 

    return { success: true, meal };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
}

export async function getMealsAction() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: "Unauthorized" };
    const userId = sessionUser.id;

    const today = getGazaTodayStart();

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
    return { success: false, error: "Something went wrong" };
  }
}

export async function deleteMealAction(mealId) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: "Unauthorized" };

    const { count } = await prisma.meal.deleteMany({
      where: { id: mealId, userId: sessionUser.id },
    });
    if (count === 0) return { success: false, error: "Meal not found" };
    revalidatePath("/dashboard/tracker");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
}

export async function getMonthlyGridDataAction(_userId, year, month) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: "Unauthorized", dailyTotals: {} };
    const userId = sessionUser.id;

    const { start: startDate, end: endDate } = getGazaMonthRange(year, month);

    const meals = await prisma.meal.findMany({
      where: {
        userId: userId,
        createdAt: { gte: startDate, lt: endDate },
      },
      select: { calories: true, createdAt: true }
    });

    const dailyTotals = {};
    meals.forEach(meal => {
      const day = getGazaDayOfMonth(meal.createdAt);
      dailyTotals[day] = (dailyTotals[day] || 0) + meal.calories;
    });

    return { success: true, dailyTotals };
  } catch (error) {
    return { success: false, dailyTotals: {} };
  }
}

export async function getMonthlyStatsAction(_userId, year, month) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: "Unauthorized", dailyTotals: {} };
    const userId = sessionUser.id;

    const { start: startDate, end: endDate } = getGazaMonthRange(year, month);

    const meals = await prisma.meal.findMany({
      where: { userId, createdAt: { gte: startDate, lt: endDate } },
    });

    const dailyTotals = {};
    meals.forEach(meal => {
      const day = getGazaDayOfMonth(meal.createdAt);
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
    return { success: false, error: "Something went wrong" };
  }
}

export async function reserveMealAction(_userId, kitchenId, quantity = 1) {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id;
    const kId = Number(kitchenId);
    const qty = Number(quantity);

    if (!userId) return { error: "يرجى تسجيل الدخول أولاً." };
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return { error: "يجب اختيار وجبة واحدة على الأقل." };

    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kId }
    });
    if (!kitchen) return { error: "المطبخ غير موجود." };

    const capacityLimit = getCapacityLimit(kitchen.capacity);
    const tomorrow = getReservationTargetDate();

    // Serializable transaction: two concurrent reservations cannot both pass the capacity check.
    const isConflict = (e) =>
      e?.code === "P2034" || /TransactionWriteConflict|could not serialize/i.test(e?.message ?? "");

    const reserve = () => prisma.$transaction(async (tx) => {
      const existingOrder = await tx.mealOrder.findFirst({
        where: { userId, kitchenId: kId, targetDate: tomorrow }
      });
      if (existingOrder) return { error: "لقد قمت بالحجز مسبقاً لهذا المطبخ لغدًا." };

      const aggregation = await tx.mealOrder.aggregate({
        where: { kitchenId: kId, targetDate: tomorrow },
        _sum: { quantity: true }
      });
      const currentTotal = aggregation._sum.quantity || 0;

      if (currentTotal + qty > capacityLimit) {
        const remaining = Math.max(capacityLimit - currentTotal, 0);
        return { error: `عذراً، المتبقي فقط ${remaining} وجبة.` };
      }

      await tx.mealOrder.create({
        data: { userId, kitchenId: kId, targetDate: tomorrow, quantity: qty }
      });
      return { ok: true };
    }, { isolationLevel: "Serializable" });

    let outcome;
    for (let attempt = 0; ; attempt++) {
      try {
        outcome = await reserve();
        break;
      } catch (e) {
        if (!isConflict(e) || attempt >= 4) throw e;
        await new Promise((r) => setTimeout(r, 25 * (attempt + 1) + Math.random() * 50));
      }
    }

    if (outcome.error) return { error: outcome.error };
    revalidatePath("/"); 
    return { success: `تم حجز ${qty} وجبات بنجاح لغدًا.` };
  } catch (error) {
    console.error("Meal Order Error:", error);
    // P2034 = serialization conflict, P2002 = duplicate reservation
    if (error?.code === "P2034" || /TransactionWriteConflict/i.test(error?.message ?? "")) return { error: "الطلبات كثيرة حالياً، حاول مرة أخرى." };
    if (error?.code === "P2002") return { error: "لقد قمت بالحجز مسبقاً لهذا المطبخ لغدًا." };
    return { error: "حدث خطأ تقني، حاول مرة أخرى لاحقاً." };
  }
}

export async function checkUserReservation(_userId, kitchenId) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return false;
  const userId = sessionUser.id;
  const tomorrow = getReservationTargetDate();

  const order = await prisma.mealOrder.findFirst({
    where: { userId, kitchenId: Number(kitchenId), targetDate: tomorrow }
  });

  return !!order; // ستعيد true إذا وجد حجز، و false إذا لم يجد
}

export async function cancelMealAction(_userId, kitchenId) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: "Unauthorized" };
  const userId = sessionUser.id;
  kitchenId = Number(kitchenId);
  const tomorrow = getReservationTargetDate();

  const orders = await prisma.mealOrder.findMany({
    where: { userId, kitchenId, targetDate: tomorrow },
    select: { quantity: true },
  });
  await prisma.mealOrder.deleteMany({
    where: { userId, kitchenId, targetDate: tomorrow }
  });
  const quantity = orders.reduce((sum, o) => sum + o.quantity, 0);
  return { success: true, quantity };
}
