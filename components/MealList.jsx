"use client";

import { Trash } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function MealItem({ meal, onDelete, lang }) {
  const isRtl = lang === "ar";

  const optionTranslations = {
    Lunch: { en: "Lunch", ar: "غداء" },
    Breakfast: { en: "Breakfast", ar: "فطور" },
    Dinner: { en: "Dinner", ar: "عشاء" },
    Snack: { en: "Snack", ar: "سناك" },
  };

  const translatedOption = optionTranslations[meal.option]?.[lang] || meal.option;

  return (
    <div className="p-6 border rounded-2xl mb-2 bg-white border-gray-100 shadow-sm transition-hover hover:shadow-md">
      <div className="flex justify-between items-center">
        <strong className="text-lg md:text-xl text-gray-800">
          {translatedOption} 
          <span className="text-sm font-normal text-gray-500 mx-2">
            ({meal.calories} {lang === "ar" ? "سعرة" : "Cal"})
          </span>
        </strong>
      </div>

      <div className="bg-green-50/50 p-5 rounded-xl flex justify-between items-center w-full mt-4">
        <span className="text-green-800 font-bold">
          {meal.mealName}
        </span>

        <button
          onClick={() => onDelete(meal.id)}
          className="p-2 hover:bg-red-50 rounded-full transition-colors group"
          title={lang === "ar" ? "حذف" : "Delete"}
        >
          <Trash size={20} className="text-red-500 group-hover:text-red-700" />
        </button>
      </div>
    </div>
  );
}

export default function MealList({ meals, onDelete }) {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const t = {
    title: { en: "Meals Added", ar: "الوجبات المضافة" },
    empty: { en: "No meals added yet.", ar: "لم يتم إضافة وجبات بعد." },
  };

  return (
    <div className="mt-10" dir={isRtl ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        {t.title[lang]}
        <span className="bg-gray-100 text-gray-600 text-sm py-1 px-3 rounded-full">
          {meals.length}
        </span>
      </h2>

      {meals.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">
          {t.empty[lang]}
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <MealItem 
              key={meal.id} 
              meal={meal} 
              onDelete={onDelete} 
              lang={lang} 
            />
          ))}
        </div>
      )}
    </div>
  );
}