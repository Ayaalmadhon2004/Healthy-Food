"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function AddMealForm({ state, dispatch, onAdd }) {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  // نصوص الترجمة
  const content = {
    title: { en: "Log New Meal", ar: "تسجيل وجبة جديدة" },
    label: { en: "Type of meals", ar: "نوع الوجبة" },
    placeholderName: { en: "Meal Name", ar: "اسم الوجبة" },
    placeholderCal: { en: "Calories", ar: "السعرات الحرارية" },
    button: { en: "+ Add Meal", ar: "+ إضافة الوجبة" },
    options: {
      lunch: { en: "Lunch", ar: "غداء" },
      breakfast: { en: "Breakfast", ar: "فطور" },
      dinner: { en: "Dinner", ar: "عشاء" },
      snack: { en: "Snack", ar: "سناك" },
    },
  };

  return (
    <div 
      className="w-full rounded-xl bg-white my-4 p-6 shadow-lg transition-all"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">
        {content.title[lang]}
      </h3>
      
      <label htmlFor="meal-option" className="block mb-2 text-sm font-medium text-gray-700">
        {content.label[lang]}
      </label>
      <select
        id="meal-option"
        className="border p-2 rounded-lg mb-4 block w-full 
        bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
        value={state.option}
        onChange={(e) =>
          dispatch({ type: "SET_OPTION", payload: e.target.value })
        }
      >
        <option value="Lunch">{content.options.lunch[lang]}</option>
        <option value="Breakfast">{content.options.breakfast[lang]}</option>
        <option value="Dinner">{content.options.dinner[lang]}</option>
        <option value="Snack">{content.options.snack[lang]}</option>
      </select>

      <input
        type="text"
        placeholder={content.placeholderName[lang]}
        value={state.mealName}
        onChange={(e) =>
          dispatch({ type: "SET_MEAL_NAME", payload: e.target.value })
        }
        className="border p-2 rounded-lg mb-4 w-full 
        bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
      />

      <input
        type="number"
        placeholder={content.placeholderCal[lang]}
        value={state.inputCalories}
        onChange={(e) =>
          dispatch({
            type: "SET_INPUT_CALORIES",
            payload: Number(e.target.value),
          })
        }
        className="border p-2 rounded-lg mb-6 w-full 
        bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
      />

      <button
        onClick={onAdd}
        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-lg w-full transition-colors shadow-md active:scale-95"
      >
        {content.button[lang]}
      </button>
    </div>
  );
}