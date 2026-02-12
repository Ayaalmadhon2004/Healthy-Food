export async function mealActions() {
  try{
    const newMeal = await prisma.meal.create({
        data: {
        userId: mealData.userId,
        mealType: mealData.mealType, 
        foodName: mealData.foodName,
        calories: parseInt(mealData.calories),
      },
    });
    revalidatePath("/dashboard/tracker");
  }
}
