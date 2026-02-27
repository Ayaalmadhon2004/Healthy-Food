"use client";

import { useLanguage } from "@/context/LanguageContext";
import { memo, useMemo } from "react"; // استيراد الأسلحة السرية للأداء

const ProgressCard = memo(({ calories }) => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  
  const goal = 2000;
  
  const { percent, remaining, statusColor } = useMemo(() => {
    const p = Math.min(100, Math.round((calories / goal) * 100));
    const r = Math.max(goal - calories, 0);
    
    let color = "bg-green-700"; 
    if (p >= 70 && p < 100) color = "bg-yellow-600";
    if (p >= 100) color = "bg-red-700";
    
    return { percent: p, remaining: r, statusColor: color };
  }, [calories]);

  const content = {
    title: { en: "Today's Goal", ar: "هدف اليوم" },
    unit: { en: "calories", ar: "سعرة حرارية" },
    remaining: { en: "calories remaining", ar: "سعرة متبقية" },
  };

  return (
    <div 
      className="w-full h-auto rounded-2xl my-4 p-6 
      bg-gradient-to-br from-[#eef5ed] to-[#f7f6f0] 
      shadow-md border border-white/50"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-800">{content.title[lang]}</h3>
        <span className="font-mono font-black text-green-800 bg-green-100/50 px-2 py-1 rounded-lg">
          {percent}%
        </span>
      </div>

      <div className="mb-4 font-bold flex items-baseline gap-1">
        <span className="text-4xl text-gray-900 tracking-tight">{calories}</span>
        <span className="text-gray-400 text-lg">/ {goal}</span>
        <span className="text-sm text-gray-500 font-medium mx-1">{content.unit[lang]}</span>
      </div>

      <div className="w-full h-4 bg-gray-200/50 rounded-full mb-6 overflow-hidden border border-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${statusColor}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className="text-gray-600 font-semibold text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        {remaining.toLocaleString()} {content.remaining[lang]}
      </p>
    </div>
  );
});

ProgressCard.displayName = "ProgressCard";

export default ProgressCard;