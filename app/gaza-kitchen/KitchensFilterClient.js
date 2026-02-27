"use client";

import { useState, useMemo } from "react";
import { MapPin, Clock, PhoneCall, CheckCircle2 } from "lucide-react";

// تعريف المناطق داخل المكون لضمان اشتغالها مع اللغة
const REGIONS = [
  { id: "ALL", en: "ALL", ar: "الكل" },
  { id: "North", en: "North", ar: "الشمال" },
  { id: "Gaza", en: "Gaza", ar: "غزة" },
  { id: "Middle", en: "Middle", ar: "الوسطى" },
  { id: "Khan Younis", en: "Khan Younis", ar: "خانيونس" },
  { id: "Rafah", en: "Rafah", ar: "رفح" },
];

export default function KitchensFilterClient({ kitchens, lang }) {
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const isAr = lang === "ar";

  // تصفية المطابخ بناءً على المنطقة المختارة
  const filteredKitchens = useMemo(() => {
    if (selectedRegion === "ALL") return kitchens;
    return kitchens.filter((k) => k.region.en === selectedRegion);
  }, [selectedRegion, kitchens]);

  return (
    <div className="w-full max-w-6xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      
      {/* 1. أزرار الفلترة (Tabs) */}
      <nav className="flex flex-wrap gap-2 mb-12 justify-center" aria-label="Region filter">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region.id)}
            className={`px-5 py-2 rounded-2xl font-bold transition-all border-2 ${
              selectedRegion === region.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                : "bg-white text-gray-500 border-gray-100 hover:border-emerald-200"
            }`}
          >
            {isAr ? region.ar : region.en}
          </button>
        ))}
      </nav>

      {/* 2. عرض المطابخ */}
      {filteredKitchens.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">
            {isAr ? "لا توجد مطابخ في هذه المنطقة حالياً." : "No kitchens found in this region."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredKitchens.map((kitchen) => (
            <article
              key={kitchen.id}
              className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-black text-2xl text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {kitchen.name[lang] || kitchen.name['en']} 
                </h2>
                <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
              </div>

              <div className="flex items-center text-gray-600 text-sm mb-6">
                <MapPin size={16} className={`${isAr ? 'ml-2' : 'mr-2'} text-emerald-500`} />
                <span className="font-medium">{kitchen.location[lang] || kitchen.location['en']}</span>
              </div>

              <div className="space-y-4 flex-grow">
                {/* وقت التوزيع */}
                <div className="flex items-start gap-3 text-sm">
                  <Clock size={18} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">{isAr ? "وقت التوزيع" : "Time"}</p>
                    <p className="text-gray-800 font-bold">{kitchen.distributionTime[lang]}</p>
                  </div>
                </div>

                {/* وجبة اليوم */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <span className="text-amber-800 text-[10px] font-black uppercase block mb-1">
                    {isAr ? "وجبة اليوم" : "Today's Menu"}
                  </span>
                  <p className="text-amber-900 font-black">{kitchen.todaysMeal[lang]}</p>
                </div>
              </div>

              {/* زر الاتصال */}
              <a 
                href={`tel:${kitchen.contact}`}
                className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-emerald-600 transition-colors shadow-lg"
              >
                <PhoneCall size={18} />
                <span dir="ltr">{kitchen.contact}</span>
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}