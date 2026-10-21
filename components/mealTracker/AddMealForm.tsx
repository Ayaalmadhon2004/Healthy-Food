"use client";

import { useState, memo, type FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";

export interface NewMealInput {
  name: string;
  calories: number;
  option: string;
}

const AddMealForm = memo(({ onAdd }: { onAdd: (meal: NewMealInput) => void }) => {
  const { lang } = useLanguage();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [option, setOption] = useState("Lunch");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mealName || !calories || Number(calories) <= 0) return;

    onAdd({ name: mealName, calories: Number(calories), option: option });
    setMealName("");
    setCalories("");
  };

  return (
    <div className="surface p-6">
      <h3 className="text-lg font-semibold mb-5 text-ink pb-2 border-b border-line">
        {lang === 'ar' ? "أضف وجبة" : "Add a meal"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقل اسم الطعام */}
        <div>
          <label htmlFor="foodName" className="label">
            {lang === 'ar' ? "اسم الطعام" : "Food"}
          </label>
          <input
            id="foodName"
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder={lang === 'ar' ? "مثلاً: شوربة عدس" : "e.g. Lentil soup"}
            className="field"
          />
        </div>

        <div className="flex gap-4">
          {/* حقل السعرات */}
          <div className="flex-1">
            <label htmlFor="calInput" className="label">
              {lang === 'ar' ? "السعرات" : "Calories"}
            </label>
            <input
              id="calInput"
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              className="field"
            />
          </div>

          {/* قائمة النوع */}
          <div className="flex-1">
            <label htmlFor="mealType" className="label">
              {lang === 'ar' ? "الوجبة" : "Meal"}
            </label>
            <select
              id="mealType"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className="field"
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
          className="btn btn-primary w-full !py-3 mt-2"
        >
          {lang === 'ar' ? "أضف" : "Add"}
        </button>
      </form>
    </div>
  );
});

AddMealForm.displayName = "AddMealForm";
export default AddMealForm;
