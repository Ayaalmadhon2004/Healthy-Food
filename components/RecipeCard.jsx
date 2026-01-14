"use client";

import Image from "next/image";
import ViewButton from "./ViewButton";
import { Clock, Activity } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { useLanguage } from "@/context/LanguageContext"; // استيراد السياق

export default function RecipeCard({ meal }) {
  const { lang } = useLanguage(); // جلب اللغة الحالية
  const isRtl = lang === "ar";

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-200"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Image
        src={meal.img}
        // استخدام [lang] للوصول للنص الصحيح
        alt={meal.title[lang]} 
        width={475}
        height={475}
        loading="lazy"
        quality={60}
        className="w-full h-48 sm:h-56 md:h-48 lg:h-56 object-cover"
      />

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-sm sm:text-base text-[var(--color-primary)] font-bold">
          {meal.type[lang]}
        </span>

        <h2 className="font-bold text-lg sm:text-xl text-gray-800">
          {meal.title[lang]}
        </h2>

        <div className="flex justify-between text-gray-600 text-xs sm:text-sm mt-2 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-green-600" /> 
            {meal.time[lang]}
          </span>
          <span className="flex items-center gap-1">
            <Activity size={14} className="text-orange-500" /> 
            {meal.cal[lang]}
          </span>
        </div>

        <div className="mt-auto space-y-2 pt-4">
          <ViewButton id={meal.id} />
          
          {/* تأكد من أن AddToCartButton مهيأ لاستقبال بيانات الوجبة باللغتين */}
          <AddToCartButton 
            meal={meal} 
            className="w-full font-bold bg-[var(--color-primary)] text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
}