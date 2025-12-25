"use client";

import { useReducer, useEffect, useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { requestNotificationPermission, showNotification } from "@/utils/notification";

// المكونات الفرعية
const ProgressCard = dynamic(() => import("@/components/ProgressCard"), { ssr: false });
const AddMealForm = dynamic(() => import("@/components/AddMealForm"), { ssr: false });
const MealList = dynamic(() => import("@/components/MealList"), { ssr: false });

const initialState = { meals: [], calories: 0, mealName: "", option: "Lunch", inputCalories: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE_STORAGE":
      return { ...state, meals: action.payload.meals, calories: action.payload.calories };
    case "SET_MEAL_NAME": return { ...state, mealName: action.payload };
    case "SET_OPTION": return { ...state, option: action.payload };
    case "SET_INPUT_CALORIES": return { ...state, inputCalories: action.payload };
    case "ADD_MEAL":
      const newMeal = { id: Date.now(), mealName: state.mealName, option: state.option, calories: Number(state.inputCalories) };
      return { ...state, meals: [...state.meals, newMeal], calories: state.calories + newMeal.calories, mealName: "", inputCalories: 0, option: "Lunch" };
    case "DELETE_MEAL":
      const updatedMeals = state.meals.filter(m => m.id !== action.payload);
      return { ...state, meals: updatedMeals, calories: updatedMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0) };
    default: return state;
  }
}

// 1️⃣ المكون الداخلي الذي يحتوي على المنطق
function TrackerContent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("meals");
    if (saved) {
      try {
        const meals = JSON.parse(saved);
        dispatch({ 
          type: "HYDRATE_STORAGE", 
          payload: { meals, calories: meals.reduce((s, m) => s + (Number(m.calories) || 0), 0) } 
        });
      } catch (e) { console.error(e); }
    }
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const meal = searchParams.get("meal");
    const cal = searchParams.get("cal");
    if (meal && cal) {
      dispatch({ type: "SET_MEAL_NAME", payload: meal });
      dispatch({ type: "SET_INPUT_CALORIES", payload: Number(cal.replace(/\D/g, "")) });
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("meals", JSON.stringify(state.meals));
  }, [state.meals, mounted]);

  const handleAddMeal = useCallback(() => {
    if (!state.mealName || state.inputCalories <= 0) return;
    dispatch({ type: "ADD_MEAL" });
    showNotification("Added", state.mealName);
  }, [state.mealName, state.inputCalories]);

  if (!mounted) return <div className="min-h-screen bg-[var(--color-primary-light)]" />;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Meal Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProgressCard calories={state.calories} />
        <AddMealForm state={state} dispatch={dispatch} onAdd={handleAddMeal} />
      </div>
      <MealList meals={state.meals} onDelete={(id) => dispatch({ type: "DELETE_MEAL", payload: id })} />
    </div>
  );
}

// 2️⃣ المكون الأساسي (Export Default) الذي يوفر الـ Suspense
export default function TrackerPage() {
  return (
    <div className="min-h-screen p-4 md:p-10 bg-[var(--color-primary-light)]">
      <Suspense fallback={<div className="text-center mt-10">Loading Tracker...</div>}>
        <TrackerContent />
      </Suspense>
    </div>
  );
}