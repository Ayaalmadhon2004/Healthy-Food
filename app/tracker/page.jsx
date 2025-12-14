"use client";

import { useReducer, useEffect, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { requestNotificationPermission, showNotification } from "@/utils/notification";


// Lazy load components
const ProgressCard = dynamic(() => import("@/components/ProgressCard"));
const AddMealForm = dynamic(() => import("@/components/AddMealForm"));
const MealList = dynamic(() => import("@/components/MealList"));

// =========================================
// Initial State & Reducer
// =========================================
const initialState = {
  meals: [],
  calories: 0,
  mealName: "",
  option: "Lunch",
  inputCalories: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_MEAL_NAME":
      return { ...state, mealName: action.payload };
    case "SET_OPTION":
      return { ...state, option: action.payload };
    case "SET_INPUT_CALORIES":
      return { ...state, inputCalories: action.payload };
    case "ADD_MEAL":
      const newMeal = {
        id: Date.now(),
        mealName: state.mealName,
        option: state.option,
        calories: state.inputCalories,
      };
      return {
        ...state,
        meals: [...state.meals, newMeal],
        calories: state.calories + state.inputCalories,
        mealName: "",
        inputCalories: 0,
      };
    case "DELETE_MEAL":
      const filtered = state.meals.filter((meal) => meal.id !== action.payload);
      const totalCalories = filtered.reduce((sum, meal) => sum + meal.calories, 0);
      return { ...state, meals: filtered, calories: totalCalories };
    case "SET_ALL":
      const total = action.payload.reduce((sum, meal) => sum + meal.calories, 0);
      return { ...state, meals: action.payload, calories: total };
    default:
      return state;
  }
}

// =========================================
// Main Page
// =========================================
export default function TrackerPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSaving, setIsSaving] = useState(false); 
  const searchParams = typeof window !== "undefined" ? useSearchParams() : null;
  /* notification permission for PWA's */
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // قراءة meal + cal من URL
  useEffect(() => {
    if (!searchParams) return;

    const mealFromQuery = searchParams.get("meal");
    const calFromQuery = Number((searchParams.get("cal") || "").replace(/\D/g, ""));

    if (mealFromQuery && !Number.isNaN(calFromQuery) && state.mealName === "") {
      dispatch({ type: "SET_MEAL_NAME", payload: mealFromQuery });
      dispatch({ type: "SET_INPUT_CALORIES", payload: calFromQuery });
    }
  }, [searchParams]);

  // Load from localStorage مرة واحدة عند البداية
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("meals")) || [];
    dispatch({ type: "SET_ALL", payload: saved });
  }, []);

  // Save to localStorage مع debounce
  useEffect(() => {
    if (isSaving) return; // منع الكتابة المتزامنة
    setIsSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem("meals", JSON.stringify(state.meals));
      setIsSaving(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [state.meals, isSaving]);

  // Add meal + notification
  const handleAddMeal = useCallback(() => {
    if (!state.mealName || state.inputCalories <= 0) return;
    dispatch({ type: "ADD_MEAL" });
    showNotification("Added", `${state.mealName} `);
  }, [state.mealName, state.inputCalories]);

  // Delete meal
  const handleDeleteMeal = useCallback((id) => {
    dispatch({ type: "DELETE_MEAL", payload: id });
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-10 bg-[var(--color-primary-light)]">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Meal Tracker</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProgressCard calories={state.calories} />
          <AddMealForm state={state} dispatch={dispatch} onAdd={handleAddMeal} />
        </div>

        <MealList meals={state.meals} onDelete={handleDeleteMeal} />
      </div>
    </div>
  );
}
