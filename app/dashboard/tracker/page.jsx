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

      <div className="grid gap-6">
        {mealTypes.map((type) => {
          const typeMeals = meals.filter((m) => m.mealType === type.id);
          const typeCalories = typeMeals.reduce((s, m) => s + m.calories, 0);

          return (
            <div key={type.id} className="space-y-4">
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-[1.8rem] ${type.color} shadow-sm`}>
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{type.label[lang]}</h3>
                    <p className="text-sm text-gray-400 font-black">{typeCalories} KCAL</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedMealType(type.id); setIsModalOpen(true); }}
                  className="p-4 bg-gray-50 text-gray-400 rounded-[1.5rem] hover:bg-green-600 hover:text-white transition-all transform active:scale-90"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="grid gap-2 px-4">
                {typeMeals.map((meal) => (
                  <div key={meal.id} className={`flex justify-between items-center p-4 bg-white/50 border border-gray-100 rounded-[1.5rem] group ${meal.isOptimistic ? 'opacity-60 italic' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-bold text-gray-700">{meal.foodName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-gray-400 text-sm">{meal.calories} kcal</span>
                      <button 
                        onClick={() => handleDelete(meal.id)} 
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <MealChart meals={meals} lang={lang} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative animate-in zoom-in duration-200 shadow-2xl">
              <h2 className="text-2xl font-black mb-8 text-gray-800">
                {lang === "ar" ? "ماذا أكلت؟" : "What did you eat?"}
              </h2>
              <div className="space-y-4">                 
                <input 
                  autoFocus
                  className="w-full p-5 bg-gray-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-green-500 font-bold transition-all" 
                  placeholder={lang === "ar" ? "اسم الطعام..." : "Food name..."}
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
                <input 
                  type="number"
                  className="w-full p-5 bg-gray-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-green-500 font-bold transition-all" 
                  placeholder={lang === "ar" ? "السعرات..." : "Calories..."}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[1.5rem] font-bold hover:bg-gray-200 transition-all">
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button onClick={handleSave} className="flex-[2] py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all">
                    {lang === "ar" ? "إضافة" : "Add"}
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      </div>
  );
};

export default MealTracker;