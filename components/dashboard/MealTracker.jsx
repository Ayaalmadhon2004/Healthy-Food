"use client";

import React, { useState } from "react";
import { Plus, Coffee, Sun, Moon, Utensils, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import MealChart from "./MealChart";

const MealTracker = () => {
  const { lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("");
  
  // 1. YOU MUST ADD THIS LINE:
  const [meals, setMeals] = useState([]); 

  const mealTypes = [
    { id: "breakfast", label: { en: "Breakfast", ar: "الفطور" }, icon: <Coffee />, color: "bg-orange-100 text-orange-600" },
    { id: "lunch", label: { en: "Lunch", ar: "الغداء" }, icon: <Sun />, color: "bg-blue-100 text-blue-600" },
    { id: "dinner", label: { en: "Dinner", ar: "العشاء" }, icon: <Moon />, color: "bg-indigo-100 text-indigo-600" },
    { id: "snacks", label: { en: "Snacks", ar: "وجبات خفيفة" }, icon: <Utensils />, color: "bg-green-100 text-green-600" },
  ];

  const openAddModal = (mealId) => {
    setSelectedMeal(mealId);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            {lang === "ar" ? "المتتبع اليومي" : "Daily Tracker"}
          </h1>
          <p className="text-gray-500 font-medium italic">
            {lang === "ar" ? "تابع سعراتك وحقق أهدافك" : "Track calories & hit your goals"}
          </p>
        </div>
        <div className="text-right bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
          {/* 2. Calculate total calories from the meals state */}
          <span className="text-3xl font-black text-green-600">
            {meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0)}
          </span>
          <span className="text-gray-400 font-bold text-sm ml-2">/ 2200 kcal</span>
        </div>
      </header>

      <div className="grid gap-5">
        {mealTypes.map((meal) => (
          <div key={meal.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-[1.5rem] ${meal.color}`}>
                {meal.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">{meal.label[lang]}</h3>
                {/* 3. Show specific calories for this type */}
                <p className="text-sm text-gray-400 font-medium">
                  {meals.filter(m => m.mealType === meal.id).reduce((acc, m) => acc + Number(m.calories), 0)} kcal
                </p>
              </div>
            </div>
            <button 
              onClick={() => openAddModal(meal.id)}
              className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-green-600 hover:text-white transition-all"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>

      {/* 4. This is where the Chart appears */}
      <div className="mt-10">
        <MealChart meals={meals} lang={lang}/>
      </div>

      {/* Modal logic remains the same... */}
    </div>
  );
};

export default MealTracker;