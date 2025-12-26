"use client";

import { Trash } from "lucide-react";


function MealItem({ meal, onDelete }) {
  return (
    <div className="p-6 border rounded-2xl mb-2 bg-white border-gray-100">
      <strong className="text-xl">
        {meal.option} ({meal.calories} Cal)
      </strong>

      <div className="bg-[var(--color-primary-light)] p-5 rounded-xl flex justify-between w-full mt-5">
        <span className="text-[var(--color-primary-dark)] font-bold">
          {meal.mealName}
        </span>

        <button
          onClick={() => onDelete(meal.id)}
          className="text-red-600 font-bold"
        >

        <Trash size={20} className="text-red-500" />

        </button>
      </div>
    </div>
  );
}

// Meal list
export default function MealList({ meals, onDelete }) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Meals Added</h2>

      {meals.length === 0 && <p>No meals added yet.</p>}

      {meals.map((meal) => (
        <MealItem key={meal.id} meal={meal} onDelete={onDelete} />
      ))}
    </div>
  );
}
