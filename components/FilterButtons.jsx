"use client";
import { useState } from "react";
import RecipeCard from "./RecipeCard";
import { useLanguage } from "@/context/LanguageContext";

export default function FilterButtons({ initialRecipes, loading = false }) {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState("All");

  // الترجمة للأزرار
  const categories = [
    { id: "All", en: "All", ar: "الكل" },
    { id: "Breakfast", en: "Breakfast", ar: "فطور" },
    { id: "Lunch", en: "Lunch", ar: "غداء" },
    { id: "Dinner", en: "Dinner", ar: "عشاء" },
    { id: "Snacks", en: "Snacks", ar: "سناك" },
  ];

  // منطق الفلترة: نقارن الـ id مع حقل type.en الموجود في قاعدة البيانات
  const filtered =
    filter === "All"
      ? initialRecipes
      : initialRecipes.filter((r) => r.type.en === filter);

  const skeletonCount = 8;

  return (
    <>
      {/* Filter Buttons */}
      <div 
        className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all duration-300 ${
              filter === cat.id
                ? "bg-green-600 text-white border-green-600 shadow-md scale-105"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat[lang]}
          </button>
        ))}
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 rounded-2xl animate-pulse"
              ></div>
            ))
          : filtered.map((meal) => (
              <RecipeCard key={meal.id} meal={meal} />
            ))}
      </div>

      {/* No Results Message */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          {lang === "ar" ? "لا توجد وصفات في هذا القسم حالياً." : "No recipes found in this category."}
        </div>
      )}
    </>
  );
}