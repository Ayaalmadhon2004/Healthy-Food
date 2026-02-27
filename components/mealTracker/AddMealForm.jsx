"use client";

import { useState, memo } from "react";
import { useLanguage } from "@/context/LanguageContext";

// استخدمنا memo لمنع إعادة رندرة الفورم إلا إذا تغيرت الـ props (وهي لن تتغير هنا)
const AddMealForm = memo(({ onAdd }) => {
  const { lang } = useLanguage();
  
  // إدارة الحالة محلياً داخل الفورم (هذا هو سر السرعة وعدم وجود Lag)
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [option, setOption] = useState("Lunch");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من البيانات قبل الإرسال
    if (!mealName || !calories || Number(calories) <= 0) {
      alert(lang === 'ar' ? "يرجى إدخال بيانات صحيحة" : "Please enter valid data");
      return;
    }

    // نرسل البيانات المجمعة لدالة handleAddMeal الموجودة في الـ Tracker
    onAdd({
      name: mealName,
      calories: Number(calories),
      option: option
    });

    // تفريغ الحقول بعد الإضافة بنجاح
    setMealName("");
    setCalories("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
        {lang === 'ar' ? "إضافة وجبة" : "Add Meal"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقل اسم الوجبة */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {lang === 'ar' ? "اسم الطعام" : "Food Name"}
          </label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder={lang === 'ar' ? "مثال: سلطة دجاج" : "e.g. Chicken Salad"}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-4">
          {/* حقل السعرات */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {lang === 'ar' ? "السعرات" : "Calories"}
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* قائمة نوع الوجبة */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {lang === 'ar' ? "النوع" : "Type"}
            </label>
            <select
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
        </div>

        {/* زر الإضافة - استخدمنا تباين ألوان عالٍ للـ Accessibility */}
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95"
        >
          {lang === 'ar' ? "+ إضافة الآن" : "+ Add Now"}
        </button>
      </form>
    </div>
  );
});

// تعيين اسم للمكون (مفيد لعملية الـ Debugging)
AddMealForm.displayName = "AddMealForm";

export default AddMealForm;