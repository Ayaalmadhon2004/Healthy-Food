"use client";

import React, { useState } from "react";
import { Plus, Coffee, Sun, Moon, Utensils, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const MealTracker = () => {
  const { lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState("");

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
    <div className="max-w-4xl mx-auto space-y-8">
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
          <span className="text-3xl font-black text-green-600">0</span>
          <span className="text-gray-400 font-bold text-sm ml-2">/ 2200 kcal</span>
        </div>
      </header>

      <div className="grid gap-5">
        {mealTypes.map((meal) => (
          <div key={meal.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center justify-between hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-[1.5rem] ${meal.color} transition-transform group-hover:scale-110`}>
                {meal.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">{meal.label[lang]}</h3>
                <p className="text-sm text-gray-400 font-medium">0 kcal</p>
              </div>
            </div>
            <button 
              onClick={() => openAddModal(meal.id)}
              className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-inner"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors">
              <X size={28} />
            </button>
            
            <h2 className="text-2xl font-black mb-8 pr-8">
              {lang === "ar" 
                ? `إضافة إلى ${mealTypes.find(m => m.id === selectedMeal)?.label.ar}` 
                : `Add to ${selectedMeal}`}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">
                  {lang === "ar" ? "اسم الوجبة" : "Meal Name"}
                </label>
                <input type="text" placeholder="..." className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-gray-700" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">
                  {lang === "ar" ? "السعرات" : "Calories"}
                </label>
                <input type="number" placeholder="0" className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-gray-700" />
              </div>
              <button className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all">
                {lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealTracker;
