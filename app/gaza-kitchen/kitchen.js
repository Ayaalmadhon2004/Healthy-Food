"use client";

import { useState } from "react";
import { MapPin, Clock, Users, PhoneCall, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext"; // استيراد الـ context

// مناطق الفلترة باللغتين
const REGIONS = [
  { id: "ALL", en: "ALL", ar: "الكل" },
  { id: "North", en: "North", ar: "الشمال" },
  { id: "Gaza", en: "Gaza", ar: "غزة" },
  { id: "Middle", en: "Middle", ar: "الوسطى" },
  { id: "Khan Younis", en: "Khan Younis", ar: "خانيونس" },
  { id: "Rafah", en: "Rafah", ar: "رفح" },
];

export default function KitchensFilter({ kitchens }) {
  const { lang } = useLanguage(); // الحصول على اللغة الحالية
  const [selected, setSelected] = useState("ALL");

  const filteredKitchens =
    selected === "ALL"
      ? kitchens
      : kitchens.filter((kitchen) => kitchen.region.en === selected);

  return (
    <>
      {/* قسم المعلومات مترجم */}
      <div className="flex justify-center items-center gap-6 mb-4 bg-[var(--color-secondary-light)] bg-opacity-50 p-5 border-[var(--color-secondary-light)] rounded-xl w-full max-w-6xl">
        <Info size={24} className="text-[var(--color-primary)] shrink-0" />
        <div>
          <h3 className="text-[var(--color-primary)] font-bold">
            {lang === "ar" ? "كيفية الحصول على الوجبات" : "How to Get Meals"}
          </h3>
          <p className="text-[var(--color-gray-300)] text-sm md:text-base">
            {lang === "ar"
              ? "جميع المطابخ أدناه تقدم وجبات مجانية للعائلات المحتاجة. يرجى الحضور خلال أوقات التوزيع الموضحة. لا يشترط التسجيل المسبق في معظم المواقع."
              : "All kitchens below provide free meals to families in need. Arrive during distribution times listed. No prior registration required at most locations."}
          </p>
        </div>
      </div>

      {/* أزرار الفلترة مترجمة */}
      <div className="flex flex-wrap gap-2 mb-4 mt-12 justify-center w-full">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => setSelected(region.id)}
            className={`px-4 py-2 rounded-full transition-all border ${
              selected === region.id
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[var(--color-primary)]"
            }`}
          >
            {lang === "ar" ? region.ar : region.en}
          </button>
        ))}
      </div>

      {/* قائمة المطابخ */}
      {filteredKitchens.length === 0 ? (
        <p className="text-gray-500 text-lg mt-10">
          {lang === "ar" ? "لا توجد مطابخ في هذه المنطقة حالياً." : "No kitchens found in this region."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-6">
          {filteredKitchens.map((kitchen) => (
            <div
              key={kitchen.id}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between border border-gray-100"
            >
              {/* Header */}
              <div>
                <h2 className="font-bold text-2xl mb-1 text-gray-800">
                  {kitchen.name[lang]}
                </h2>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin size={16} className={`${lang === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span>{kitchen.location[lang]}</span>
                </div>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {lang === "ar" ? "مفتوح ويقدم الوجبات" : "Open & Serving"}
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-3 text-gray-700 text-sm">
                <div className="flex items-center">
                  <Clock size={16} className={`${lang === 'ar' ? 'ml-2' : 'mr-2'} text-gray-400`} />
                  <span>
                    <strong>{lang === "ar" ? "وقت التوزيع:" : "Distribution Time:"}</strong> {kitchen.distributionTime[lang]}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Users size={16} className={`${lang === 'ar' ? 'ml-2' : 'mr-2'} text-gray-400`} />
                  <span>
                    <strong>{lang === "ar" ? "السعة:" : "Capacity:"}</strong> {kitchen.capacity[lang]}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border-r-4 border-[var(--color-primary)]">
                  <strong className="text-[var(--color-primary)] text-xs block mb-1">
                    {lang === "ar" ? "وجبة اليوم" : "TODAY'S MEAL"}
                  </strong>
                  <p className="font-medium">{kitchen.todaysMeal[lang]}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong className="text-blue-700 text-xs block mb-1 uppercase">
                    {lang === "ar" ? "معلومات الوصول" : "Access Information"}
                  </strong>
                  <p className="text-blue-900">{kitchen.accessInfo[lang]}</p>
                </div>

                <div className="flex items-center text-green-600 font-medium pt-2">
                  <PhoneCall size={16} className={`${lang === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  <span dir="ltr">{kitchen.contact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}