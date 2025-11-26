"use client";

import { useReducer, useEffect, memo } from "react";

// ======= Initial State & Reducer =======
const initialState = {
  recipes: [],
  filtered: [],
  filter: "All",
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_RECIPES":
      return {
        ...state,
        recipes: action.payload,
        filtered: action.payload,
        loading: false,
      };
    case "SET_FILTER":
      const filter = action.payload;
      const filtered =
        filter === "All"
          ? state.recipes
          : state.recipes.filter((r) => r.type === filter);
      return { ...state, filter, filtered };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

// ======= Filter Buttons Component =======
const FilterButtons = memo(({ currentFilter, dispatch }) => {
  const types = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];
  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => dispatch({ type: "SET_FILTER", payload: type })}
          className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm sm:text-base ${
            currentFilter === type
              ? "bg-[var(--color-primary)] text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
});
FilterButtons.displayName = "FilterButtons";

// ======= Recipe Card Component =======
const RecipeCard = memo(({ meal }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-200">
    <img
      src={meal.img}
      alt={meal.title}
      className="w-full h-48 sm:h-56 md:h-48 lg:h-56 object-cover"
    />
    <div className="p-4 flex flex-col gap-2 flex-1">
      <span className="text-sm sm:text-base text-[var(--color-primary)] font-bold">{meal.type}</span>
      <h2 className="font-bold text-lg sm:text-xl">{meal.title}</h2>
      <div className="flex justify-between text-gray-600 text-xs sm:text-sm mt-2">
        <span><i className="fa-regular fa-clock"></i>   {meal.time}</span>
        <span><i class="fa-solid fa-fire"></i>   {meal.cal}</span>
      </div>
      <button className="mt-4 bg-[var(--color-primary)] text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors text-sm sm:text-base">
        View Recipe
      </button>
    </div>
  </div>
));
RecipeCard.displayName = "RecipeCard";

// ======= Main Page Component =======
export default function Page() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/recipes");
        if (!res.ok) throw new Error("Failed to fetch recipes");
        const data = await res.json();
        dispatch({ type: "SET_RECIPES", payload: data });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error.message });
      }
    };
    fetchRecipes();
  }, []);

  if (state.loading)
    return <p className="p-4 text-center text-lg">Loading recipes...</p>;
  if (state.error)
    return <p className="p-4 text-center text-red-500">{state.error}</p>;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 bg-[var(--color-primary-light)]">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left">
        Browse Recipes
      </h1>

      {/* Filter Buttons */}
      <FilterButtons currentFilter={state.filter} dispatch={dispatch} />

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {state.filtered.map((meal) => (
          <RecipeCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
}
