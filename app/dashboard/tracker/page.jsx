"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr"; 
import { Plus, Coffee, Sun, Moon, Utensils, X, Trash2, Loader2, Sparkles, CheckCircle } from "lucide-react"; // أضفنا أيقونات جديدة
import { useLanguage } from "@/context/LanguageContext";
import { addMealAction, getMealsAction, deleteMealAction } from "@/app/actions/mealActions";
import MealChart from "@/components/dashboard/MealChart";
import { useSearchParams } from "next/navigation"; // أضفنا هذا لجلب باراميتر النجاح

const MealTracker = () => {
  const { lang } = useLanguage();
  const searchParams = useSearchParams(); // استخدام السينسور الخاص بالرابط
  const isAr = lang === "ar";
  
  // التحقق من وجود success=true في الرابط
  const isReportSuccess = searchParams.get("success") === "true";

  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  // ... (باقي الـ States الخاصة بكِ كما هي)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // ... (دالة loadMeals وباقي الدوال كما هي)
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

  // حساب السعرات
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-green-600" size={40} />
      <p className="text-gray-400 font-bold">
        {isAr ? "جاري تحميل البيانات..." : "Loading your data..."}
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* --- بنر نجاح إرسال البلاغ --- */}
      {isReportSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2.5rem] shadow-sm animate-in zoom-in duration-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-2 rounded-full text-white shadow-lg">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="font-black text-emerald-900">
                {isAr ? "تم إرسال بلاغ المنطقة بنجاح!" : "Area Report Submitted!"}
              </h4>
              <p className="text-emerald-700 text-sm font-medium">
                {isAr 
                  ? "شكراً لمساعدتنا في الوصول للمحتاجين، سيتم تتبع الحالة في قسم التقارير." 
                  : "Thanks for helping us reach those in need. Tracking is active."}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* --- نهاية البنر --- */}

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isAr ? "المتتبع اليومي" : "Daily Tracker"}
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">
            {isAr ? "تابع سعراتك وحقق أهدافك" : "Track calories & hit your goals"}
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
      
      {/* باقي الأقسام الخاصة بكِ... */}
    </div>
  );
};

export default MealTracker;