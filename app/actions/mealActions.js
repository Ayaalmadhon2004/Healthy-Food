"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function getTodaysMealsAction(userId) {
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

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    return { 
      success: true, 
      meals, 
      totalCalories,
      count: meals.length 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getMealsAction(userId) {
  try {
    const meals = await prisma.meal.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, meals };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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