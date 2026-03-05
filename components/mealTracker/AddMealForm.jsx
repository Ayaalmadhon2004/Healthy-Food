"use client";

import { useState, memo } from "react";
import { useLanguage } from "@/context/LanguageContext";

const AddMealForm = memo(({ onAdd }) => {
  const { lang } = useLanguage();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [option, setOption] = useState("Lunch");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mealName || !calories || Number(calories) <= 0) return;

    onAdd({ name: mealName, calories: Number(calories), option: option });
    setMealName("");
    setCalories("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]"> 
      {/* أضفنا min-h لتقليل الـ Layout Shift (CLS) المذكور في تقريرك */}
      
      <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
        {lang === 'ar' ? "إضافة وجبة" : "Add Meal"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقل اسم الطعام مع Label مخفي للمكفوفين (Accessibility) */}
        <div>
          <label htmlFor="foodName" className="sr-only">
            {lang === 'ar' ? "اسم الطعام" : "Food Name"}
          </label>
          <input
            id="foodName"
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder={lang === 'ar' ? "اسم الطعام (مثلاً: سلطة)" : "Food Name (e.g. Salad)"}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition-all text-gray-900"
          />
        </div>

        <div className="flex gap-4">
          {/* حقل السعرات مع Label */}
          <div className="flex-1">
            <label htmlFor="calInput" className="block text-xs font-bold text-gray-600 mb-1 ml-1">
              {lang === 'ar' ? "السعرات" : "Calories"}
            </label>
            <input
              id="calInput"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none text-gray-900"
            />
          </div>

          {/* قائمة النوع مع Label (لحل خطأ Accessibility في تقريرك) */}
          <div className="flex-1">
            <label htmlFor="mealType" className="block text-xs font-bold text-gray-600 mb-1 ml-1">
              {lang === 'ar' ? "النوع" : "Type"}
            </label>
            <select
              id="mealType"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none text-gray-900 appearance-none"
            >
              <option value="Breakfast">{lang === 'ar' ? "فطور" : "Breakfast"}</option>
              <option value="Lunch">{lang === 'ar' ? "غداء" : "Lunch"}</option>
              <option value="Dinner">{lang === 'ar' ? "عشاء" : "Dinner"}</option>
              <option value="Snack">{lang === 'ar' ? "سناك" : "Snack"}</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-4 rounded-xl shadow-md transition-all active:scale-95 mt-2"
        >
          {lang === 'ar' ? "+ إضافة الآن" : "+ Add Now"}
        </button>
      </form>
    </div>
  );
});

AddMealForm.displayName = "AddMealForm";
export default AddMealForm;