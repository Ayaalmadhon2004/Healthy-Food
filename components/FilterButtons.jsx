"use client";
import { useState } from "react";
import RecipeCard from "./RecipeCard";

export default function FilterButtons({ initialRecipes }) {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? initialRecipes
      : initialRecipes.filter((r) => r.type === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
        {["All", "Breakfast", "Lunch", "Dinner", "Snacks"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors ${
              filter === type
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((meal) => (
          <RecipeCard key={meal.id} meal={meal} />
        ))}
      </div>
    </>
  );
}
