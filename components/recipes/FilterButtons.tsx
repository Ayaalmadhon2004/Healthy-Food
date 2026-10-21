"use client";
import { useState } from "react";
import RecipeCard from "./RecipeCard";
import { useLanguage } from "@/context/LanguageContext";
import type { Localized, Recipe } from "@/lib/types";

export default function FilterButtons({ initialRecipes, loading = false }: { initialRecipes: Recipe[]; loading?: boolean }) {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState("All");

  const categories: (Localized & { id: string })[] = [
    { id: "All", en: "All", ar: "الكل" },
    { id: "Breakfast", en: "Breakfast", ar: "فطور" },
    { id: "Lunch", en: "Lunch", ar: "غداء" },
    { id: "Dinner", en: "Dinner", ar: "عشاء" },
    { id: "Snacks", en: "Snacks", ar: "سناك" },
  ];

  const filtered =
    filter === "All"
      ? initialRecipes
      : initialRecipes.filter((r) => r.type.en === filter);

  const skeletonCount = 8;

  const count = filtered.length;
  const countLabel = lang === "ar"
    ? `${count} ${count === 1 ? "وصفة" : "وصفات"}`
    : `${count} ${count === 1 ? "recipe" : "recipes"}`;

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-8"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label={lang === "ar" ? "تصفية حسب الوجبة" : "Filter by meal"}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              aria-pressed={filter === cat.id}
              className="chip"
            >
              {cat[lang]}
            </button>
          ))}
        </div>
        {!loading && <p className="text-sm text-ink-mute" aria-live="polite">{countLabel}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="h-72 bg-paper-deep rounded-lg"
              ></div>
            ))
          : filtered.map((meal, index) => (
              <RecipeCard key={meal.id} meal={meal} lang={lang} index={index} />
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-ink-soft">
          {lang === "ar" ? "لا توجد وصفات في هذا القسم حالياً." : "No recipes in this category yet."}
        </div>
      )}
    </>
  );
}
