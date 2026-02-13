"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr"; 
import { Plus, Coffee, Sun, Moon, Utensils, X, Trash2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { addMealAction, getMealsAction, deleteMealAction } from "@/app/actions/mealActions";
import MealChart from "@/components/dashboard/MealChart"

const MealTracker = () => {
  const { lang } = useLanguage();
  
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const mealTypes = [
    { id: "breakfast", label: { en: "Breakfast", ar: "الفطور" }, icon: <Coffee />, color: "bg-orange-100 text-orange-600" },
    { id: "lunch", label: { en: "Lunch", ar: "الغداء" }, icon: <Sun />, color: "bg-blue-100 text-blue-600" },
    { id: "dinner", label: { en: "Dinner", ar: "العشاء" }, icon: <Moon />, color: "bg-indigo-100 text-indigo-600" },
    { id: "snacks", label: { en: "Snacks", ar: "وجبات خفيفة" }, icon: <Utensils />, color: "bg-green-100 text-green-600" },
  ];

  const loadMeals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const result = await getMealsAction(user.id);
        if (result.success) setMeals(result.meals);
      }
    } catch (error) {
      console.error("Error loading meals:", error);
    } finally {
      setInitialLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleSave = async () => {
    if (!foodName || !calories) return;

    const tempId = Date.now().toString();
    const tempMeal = {
      id: tempId,
      foodName,
      calories: parseInt(calories),
      mealType: selectedMealType,
      isOptimistic: true,
    };

    setMeals((prev) => [tempMeal, ...prev]);
    setIsModalOpen(false);
    setFoodName("");
    setCalories("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const result = await addMealAction({
        userId: user.id,
        mealType: selectedMealType,
        foodName: tempMeal.foodName,
        calories: tempMeal.calories,
      });

      if (!result.success) {
        setMeals((prev) => prev.filter((m) => m.id !== tempId));
        alert("Failed to save to database");
      } else {
        setMeals((prev) => prev.map((m) => (m.id === tempId ? result.meal : m)));
      }
    } catch (error) {
      setMeals((prev) => prev.filter((m) => m.id !== tempId));
      alert("Error saving meal");
    }
  };

  const handleDelete = async (id) => {
    const originalMeals = [...meals];
    setMeals(meals.filter((m) => m.id !== id));

    const result = await deleteMealAction(id);
    if (!result.success) {
      setMeals(originalMeals);
      alert("Delete failed");
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-green-600" size={40} />
      <p className="text-gray-400 font-bold">
        {lang === "ar" ? "جاري تحميل البيانات..." : "Loading your data..."}
      </p>
    </div>
  );
  console.log("meals",meals);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {lang === "ar" ? "المتتبع اليومي" : "Daily Tracker"}
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">
            {lang === "ar" ? "تابع سعراتك وحقق أهدافك" : "Track calories & hit your goals"}
          </p>
        </div>
        <div className="text-right bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-green-100/20">
          <span className="text-4xl font-black text-green-600">{totalCalories}</span>
          <span className="text-gray-400 font-bold text-sm ml-2 block sm:inline">/ 2200 kcal</span>
        </div>
      </header>

      <div className="mt-10">
        <MealChart meals={meals} lang={lang} />
      </div>

      </div>
  );
};

export default MealTracker;