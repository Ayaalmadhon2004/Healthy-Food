"use client";

import { memo } from "react";
import { Trash } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Lang, Localized, TrackedMeal } from "@/lib/types";

// 1. استخدام memo لكل وجبة بشكل منفصل
// هذا يضمن أن الوجبة القديمة لا تتأثر نهائياً عند إضافة وجبة جديدة فوقها
interface MealItemProps {
  meal: TrackedMeal;
  onDelete: (id: string | number) => void;
  lang: Lang;
}

const MealItem = memo(({ meal, onDelete, lang }: MealItemProps) => {
  const optionTranslations: Record<string, Localized> = {
    Lunch: { en: "Lunch", ar: "غداء" },
    Breakfast: { en: "Breakfast", ar: "فطور" },
    Dinner: { en: "Dinner", ar: "عشاء" },
    Snack: { en: "Snack", ar: "سناك" },
  };

  const translatedOption = optionTranslations[meal.mealType || meal.option || ""]?.[lang] || meal.option;

  return (
    <li className="settle flex items-center justify-between gap-4 py-4 border-b border-line">
      <div className="min-w-0">
        <p className="text-sm text-ink-mute">
          {translatedOption} <span className="tabular-nums">· {meal.calories} {lang === "ar" ? "سعرة" : "cal"}</span>
        </p>
        <p className="text-lg font-medium text-ink break-words">{meal.foodName}</p>
      </div>

      <button
        onClick={() => onDelete(meal.id)}
        className="p-2 rounded-md text-ink-mute hover:text-brick-700 hover:bg-brick-50 transition-colors shrink-0"
        title={lang === "ar" ? "حذف" : "Delete"}
        aria-label={lang === "ar" ? "حذف" : "Delete"}
      >
        <Trash size={18} strokeWidth={1.75} />
      </button>
    </li>
  );
});

MealItem.displayName = "MealItem";

// 2. استخدام memo للقائمة بالكامل
const MealList = memo(({ meals, onDelete }: { meals: TrackedMeal[]; onDelete: (id: string | number) => void }) => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const t: Record<string, Localized> = {
    title: { en: "Today's meals", ar: "وجبات اليوم" },
    empty: { en: "Nothing logged yet. Add your first meal above.", ar: "لم تسجّل شيئاً بعد. أضف أول وجبة من النموذج." },
  };

  return (
    <div className="mt-10" dir={isRtl ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-medium mb-2 text-ink">
        {t.title[lang]}
        <span className="text-ink-mute text-lg ms-2 tabular-nums">{meals.length}</span>
      </h2>

      {meals.length === 0 ? (
        <p className="py-10 text-ink-soft border-t border-line-strong">
          {t.empty[lang]}
        </p>
      ) : (
        <ul className="border-t border-line-strong">
          {meals.map((meal) => (
            <MealItem
              key={meal.id}
              meal={meal}
              onDelete={onDelete}
              lang={lang}
            />
          ))}
        </ul>
      )}
    </div>
  );
});

MealList.displayName = "MealList";

export default MealList;