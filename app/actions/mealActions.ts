"use server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { getServerMessages } from "@/lib/i18n";
import { getGazaDayOfMonth, getGazaMonthRange, getGazaTodayStart, getReservationTargetDate } from "@/lib/dates";
import { getCapacityLimit } from "@/lib/capacity";
import { readCalorieGoal, validateCalorieGoalInput, withCalorieGoal } from "@/lib/calorieGoal";

type ReservationFailure = { error: string; remaining?: number };
type ReservationOutcome = { ok: true } | ReservationFailure;

async function loadCalorieGoal(userId: string): Promise<number> {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: { health_goals: true } });
  return readCalorieGoal(row?.health_goals);
}

export async function getCalorieGoalAction() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized };
    return { success: true, goal: await loadCalorieGoal(sessionUser.id) };
  } catch (error) {
    console.error("mealActions error:", error);
    return { success: false, error: (await getServerMessages()).somethingWrong };
  }
}

export async function setCalorieGoalAction(value: unknown) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized };

    const goal = validateCalorieGoalInput(value);
    if (goal === null) return { success: false, error: "INVALID_GOAL" };

    const row = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { health_goals: true } });
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { health_goals: withCalorieGoal(row?.health_goals, goal) as Prisma.InputJsonObject },
    });

    revalidatePath("/tracker");
    revalidatePath("/dashboard/tracker/monthly");
    return { success: true, goal };
  } catch (error) {
    console.error("mealActions error:", error);
    return { success: false, error: (await getServerMessages()).somethingWrong };
  }
}

interface NewMeal {
  mealType: string;
  foodName: string;
  calories: number | string;
}

export async function addMealAction(data: NewMeal) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized };

    const calories = Number.parseInt(String(data.calories), 10);
    if (!Number.isFinite(calories) || calories < 0 || calories > 20000) {
      return { success: false, error: (await getServerMessages()).invalidCalories };
    }

    const meal = await prisma.meal.create({
      data: {
        userId: sessionUser.id,
        mealType: data.mealType,
        foodName: data.foodName,
        calories,
      }
    });

    revalidatePath("/dashboard/tracker");
    revalidatePath("/dashboard"); 

    return { success: true, meal };
  } catch (error) {
    console.error("mealActions error:", error);
    return { success: false, error: (await getServerMessages()).somethingWrong };
  }
}

export async function getMealsAction() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized };
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
    console.error("mealActions error:", error);
    return { success: false, error: (await getServerMessages()).somethingWrong };
  }
}

export async function deleteMealAction(mealId: string) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized };

    const { count } = await prisma.meal.deleteMany({
      where: { id: mealId, userId: sessionUser.id },
    });
    if (count === 0) return { success: false, error: (await getServerMessages()).mealNotFound };
    revalidatePath("/dashboard/tracker");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("mealActions error:", error);
    return { success: false, error: (await getServerMessages()).somethingWrong };
  }
}

// Calories per Gaza day of the month.
function sumByDay(meals: { calories: number; createdAt: Date }[]): Record<number, number> {
  const totals: Record<number, number> = {};
  for (const meal of meals) {
    const day = getGazaDayOfMonth(meal.createdAt);
    totals[day] = (totals[day] || 0) + meal.calories;
  }
  return totals;
}

export async function getMonthlyGridDataAction(_userId: unknown, year: number, month: number) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized, dailyTotals: {} };
    const userId = sessionUser.id;

    const { start: startDate, end: endDate } = getGazaMonthRange(year, month);

    const meals = await prisma.meal.findMany({
      where: {
        userId: userId,
        createdAt: { gte: startDate, lt: endDate },
      },
      select: { calories: true, createdAt: true }
    });

    const dailyTotals = sumByDay(meals);

    return { success: true, dailyTotals, goal: await loadCalorieGoal(userId) };
  } catch (error) {
    console.error("mealActions error:", error);
    return { success: false, dailyTotals: {} };
  }
}

export async function getMonthlyStatsAction(_userId: unknown, year: number, month: number) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized, dailyTotals: {} };
    const userId = sessionUser.id;

    const { start: startDate, end: endDate } = getGazaMonthRange(year, month);

    const meals = await prisma.meal.findMany({
      where: { userId, createdAt: { gte: startDate, lt: endDate } },
    });

    const dailyTotals = sumByDay(meals);

    const totalsArray = Object.values(dailyTotals);
    const avgCalories = totalsArray.length > 0 
      ? Math.round(totalsArray.reduce((a, b) => a + b, 0) / totalsArray.length) 
      : 0;
    
    // Commitment days: days with intake at or under the user's own daily goal
    const goal = await loadCalorieGoal(userId);
    const commitmentDays = totalsArray.filter(v => v <= goal && v > 0).length;

    return { 
      success: true, 
      stats: { 
        avgCalories, 
        commitmentDays, 
        totalMeals: meals.length,
        goal
      } 
    };
  } catch (error) {
    console.error("mealActions error:", error);
    return { success: false, error: (await getServerMessages()).somethingWrong };
  }
}

export async function reserveMealAction(_userId: unknown, kitchenId: number | string, quantity: number = 1): Promise<ReservationFailure | { success: true; quantity: number }> {
  try {
    const sessionUser = await getSessionUser();
    const userId = sessionUser?.id;
    const kId = Number(kitchenId);
    const qty = Number(quantity);

    if (!userId) return { error: "LOGIN_REQUIRED" };
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return { error: "INVALID_QUANTITY" };

    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kId }
    });
    if (!kitchen) return { error: "KITCHEN_NOT_FOUND" };

    const capacityLimit = getCapacityLimit(kitchen.capacity);
    const tomorrow = getReservationTargetDate();

    // Serializable transaction: two concurrent reservations cannot both pass the capacity check.
    const isConflict = (e: unknown) =>
      (e as { code?: string })?.code === "P2034" || /TransactionWriteConflict|could not serialize/i.test((e as Error)?.message ?? "");

    const reserve = (): Promise<ReservationOutcome> => prisma.$transaction(async (tx): Promise<ReservationOutcome> => {
      const existingOrder = await tx.mealOrder.findFirst({
        where: { userId, kitchenId: kId, targetDate: tomorrow }
      });
      if (existingOrder) return { error: "ALREADY_RESERVED" };

      const aggregation = await tx.mealOrder.aggregate({
        where: { kitchenId: kId, targetDate: tomorrow },
        _sum: { quantity: true }
      });
      const currentTotal = aggregation._sum.quantity || 0;

      if (currentTotal + qty > capacityLimit) {
        const remaining = Math.max(capacityLimit - currentTotal, 0);
        return { error: "NOT_ENOUGH_LEFT", remaining };
      }

      await tx.mealOrder.create({
        data: { userId, kitchenId: kId, targetDate: tomorrow, quantity: qty }
      });
      return { ok: true };
    }, { isolationLevel: "Serializable" });

    let outcome: ReservationOutcome;
    for (let attempt = 0; ; attempt++) {
      try {
        outcome = await reserve();
        break;
      } catch (e) {
        if (!isConflict(e) || attempt >= 4) throw e;
        await new Promise((r) => setTimeout(r, 25 * (attempt + 1) + Math.random() * 50));
      }
    }

    if ("error" in outcome) return outcome;
    revalidatePath("/"); 
    return { success: true, quantity: qty };
  } catch (error) {
    console.error("Meal Order Error:", error);
    // P2034 = serialization conflict, P2002 = duplicate reservation
    const { code, message } = error as { code?: string; message?: string };
    if (code === "P2034" || /TransactionWriteConflict/i.test(message ?? "")) return { error: "BUSY" };
    if (code === "P2002") return { error: "ALREADY_RESERVED" };
    return { error: "GENERIC" };
  }
}

export async function checkUserReservation(_userId: unknown, kitchenId: number | string) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return false;
  const userId = sessionUser.id;
  const tomorrow = getReservationTargetDate();

  const order = await prisma.mealOrder.findFirst({
    where: { userId, kitchenId: Number(kitchenId), targetDate: tomorrow }
  });

  return !!order; // ستعيد true إذا وجد حجز، و false إذا لم يجد
}

export async function cancelMealAction(_userId: unknown, kitchenId: number | string) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: (await getServerMessages()).unauthorized };
  const userId = sessionUser.id;
  const kId = Number(kitchenId);
  const tomorrow = getReservationTargetDate();

  const orders = await prisma.mealOrder.findMany({
    where: { userId, kitchenId: kId, targetDate: tomorrow },
    select: { quantity: true },
  });
  await prisma.mealOrder.deleteMany({
    where: { userId, kitchenId: kId, targetDate: tomorrow }
  });
  const quantity = orders.reduce((sum, o) => sum + o.quantity, 0);
  return { success: true, quantity };
}
