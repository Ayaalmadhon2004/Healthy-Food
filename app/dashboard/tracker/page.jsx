"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr"; 
import { 
  Plus, Coffee, Sun, Moon, Utensils, X, 
  Trash2, Loader2, Sparkles, 
} from "lucide-react"; 
import { useLanguage } from "@/context/LanguageContext";
import { addMealAction, getMealsAction, deleteMealAction } from "@/app/actions/mealActions";
import MealChart from "@/components/dashboard/MealChart";

const MealTracker = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحميل الوجبات
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

  // إضافة وجبة جديدة
  const handleAddMeal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const result = await addMealAction({
        userId: user.id,
        type: selectedMealType,
        name: foodName,
        calories: parseInt(calories),
      });

      if (result.success) {
        setFoodName("");
        setCalories("");
        setIsModalOpen(false);
        loadMeals();
      }
    }
    setIsSubmitting(false);
  };

  // حذف وجبة
  const handleDeleteMeal = async (mealId) => {
    const result = await deleteMealAction(mealId);
    if (result.success) {
      loadMeals();
    }
  };

  // حساب إجمالي السعرات
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="text-gray-400 font-bold">
        {isAr ? "جاري تحميل البيانات..." : "Loading your data..."}
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      

      {/* --- الهيدر وإحصائيات السعرات --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isAr ? "المتتبع اليومي" : "Daily Tracker"}
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">
            {isAr ? "تابع سعراتك وحقق أهدافك" : "Track calories & hit your goals"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-emerald-100/20 flex items-baseline gap-2">
          <span className="text-4xl font-black text-emerald-600">{totalCalories}</span>
          <span className="text-gray-400 font-bold text-sm">/ 2200 kcal</span>
        </div>
      </header>

      {/* --- الرسم البياني --- */}
      <div className="bg-white p-6 rounded-[3rem] border border-gray-50 shadow-sm">
        <MealChart meals={meals} lang={lang} />
      </div>

      {/* --- قائمة الوجبات --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                {meal.type === "breakfast" && <Coffee className="text-orange-500" />}
                {meal.type === "lunch" && <Sun className="text-yellow-500" />}
                {meal.type === "dinner" && <Moon className="text-indigo-500" />}
                {meal.type === "snack" && <Sparkles className="text-emerald-500" />}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{meal.name}</h4>
                <p className="text-sm text-gray-400 font-medium">{meal.calories} kcal</p>
              </div>
            </div>
            <button 
              onClick={() => handleDeleteMeal(meal.id)}
              className="text-gray-300 hover:text-red-500 p-2 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* --- زر إضافة وجبة (Floating) --- */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 bg-gray-900 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center gap-2"
      >
        <Plus size={28} />
      </button>

      {/* --- مودال الإضافة --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900">
                {isAr ? "إضافة وجبة" : "Add Meal"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddMeal} className="space-y-6">
              {/* اختيار نوع الوجبة */}
              <div className="grid grid-cols-4 gap-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedMealType(type)}
                    className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                      selectedMealType === type ? 'bg-emerald-600 text-white scale-105 shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {type === 'breakfast' && <Coffee size={20} />}
                    {type === 'lunch' && <Sun size={20} />}
                    {type === 'dinner' && <Moon size={20} />}
                    {type === 'snack' && <Sparkles size={20} />}
                  </button>
                ))}
              </div>

              <input 
                placeholder={isAr ? "اسم الطعام" : "Food Name"}
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              />
              
              <input 
                type="number"
                placeholder={isAr ? "السعرات" : "Calories"}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              />

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Utensils size={20} />}
                {isAr ? "حفظ الوجبة" : "Save Meal"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MealTracker;