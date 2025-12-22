"use client";

import { useReducer, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  requestNotificationPermission,
  showNotification,
} from "@/utils/notification";

// Lazy load components
const ProgressCard = dynamic(() => import("@/components/ProgressCard"));
const AddMealForm = dynamic(() => import("@/components/AddMealForm"));
const MealList = dynamic(() => import("@/components/MealList"));

// =========================================
// Initial State
// =========================================
const initialState = {
  meals: [],
  calories: 0,
  mealName: "",
  option: "Lunch",
  inputCalories: 0,
};

// =========================================
// Reducer
// =========================================
function reducer(state, action) {
  switch (action.type) {
    case "SET_MEAL_NAME":
      return { ...state, mealName: action.payload };

    case "SET_OPTION":
      return { ...state, option: action.payload };

    case "SET_INPUT_CALORIES":
      return { ...state, inputCalories: action.payload };

    case "ADD_MEAL": {
      const newMeal = {
        id: Date.now(),
        mealName: state.mealName,
        option: state.option,
        calories: Number(state.inputCalories),
      };

      return {
        ...state,
        meals: [...state.meals, newMeal],
        calories: state.calories + newMeal.calories,
        mealName: "",
        inputCalories: 0,
      };
    }

    case "DELETE_MEAL": {
      const meals = state.meals.filter(
        (meal) => meal.id !== action.payload
      );
      const calories = meals.reduce(
        (sum, meal) => sum + meal.calories,
        0
      );
      return { ...state, meals, calories };
    }

    default:
      return state;
  }
}

// =========================================
// Init from localStorage (ONCE)
// =========================================
function init() {
  const savedMeals =
    JSON.parse(localStorage.getItem("meals")) || [];

  const totalCalories = savedMeals.reduce(
    (sum, meal) => sum + Number(meal.calories || 0),
    0
  );

  return {
    ...initialState,
    meals: savedMeals,
    calories: totalCalories,
  };
}

// =========================================
// Page
// =========================================
export default function TrackerPage() {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    init
  );

  const searchParams = useSearchParams();

  // Notification permission
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // =========================================
  // READ FROM URL → FILL INPUTS ONLY
  // =========================================
  useEffect(() => {
    const mealFromQuery = searchParams.get("meal");
    const calFromQuery = Number(
      (searchParams.get("cal") || "").replace(/\D/g, "")
    );

    if (
      mealFromQuery &&
      !Number.isNaN(calFromQuery) &&
      state.mealName === ""
    ) {
      dispatch({
        type: "SET_MEAL_NAME",
        payload: mealFromQuery,
      });
      dispatch({
        type: "SET_INPUT_CALORIES",
        payload: calFromQuery,
      });
    }
  }, [searchParams]);

  // =========================================
  // Save to localStorage
  // =========================================
  useEffect(() => {
    localStorage.setItem(
      "meals",
      JSON.stringify(state.meals)
    );
  }, [state.meals]);

  // =========================================
  // Add meal (ONLY from button)
  // =========================================
  const handleAddMeal = useCallback(() => {
    if (!state.mealName || state.inputCalories <= 0)
      return;

    dispatch({ type: "ADD_MEAL" });
    showNotification("Added", state.mealName);
  }, [state.mealName, state.inputCalories]);

  // =========================================
  // Delete meal
  // =========================================
  const handleDeleteMeal = useCallback((id) => {
    dispatch({ type: "DELETE_MEAL", payload: id });
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-10 bg-[var(--color-primary-light)]">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Meal Tracker
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProgressCard calories={state.calories} />
          <AddMealForm
            state={state}
            dispatch={dispatch}
            onAdd={handleAddMeal}
          />
        </div>

        <MealList
          meals={state.meals}
          onDelete={handleDeleteMeal}
        />
      </div>
    </div>
  );
}
