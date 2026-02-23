"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function ProgressCard({ calories }) {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  
  const goal = 2000;
  const percent = Math.min(100, Math.round((calories / goal) * 100));
  const remaining = Math.max(goal - calories, 0);

  // نصوص الترجمة
  const content = {
    title: { en: "Today's Goal", ar: "هدف اليوم" },
    unit: { en: "calories", ar: "سعرة حرارية" },
    remaining: { en: "calories remaining", ar: "سعرة متبقية" },
  };

  return (
    <div 
      className="w-full h-auto rounded-xl my-4 p-6 
      bg-gradient-to-br from-[rgba(227,238,224,1)] to-[rgba(240,238,226,1)] 
      shadow-lg"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between pb-8">
        <h3 className="font-bold text-xl">{content.title[lang]}</h3>
        <span className="font-mono font-bold">{percent}%</span>
      </div>

      <div className="pb-8 font-medium">
        <span className="text-2xl">{calories}</span>
        <span className="text-gray-500 mx-2">/ {goal}</span>
        <span className="text-sm text-gray-600">{content.unit[lang]}</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-4 bg-white/40 rounded-full mb-8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percent < 70
              ? "bg-green-600"
              : percent < 100
              ? "bg-yellow-500"
              : "bg-red-600"
          }`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className="text-gray-600 font-medium">
        {remaining} {content.remaining[lang]}
      </p>
    </div>
  );
}