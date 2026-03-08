"use client";

import { useState, useMemo } from "react";
import { MapPin, Clock, PhoneCall, CheckCircle2 } from "lucide-react";
import MealRegistration from "@/components/kitchen/MealRegistration"; 

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

  const filteredKitchens = useMemo(() => {
    if (selectedRegion === "ALL") return kitchens;
    
    return kitchens.filter((k) => {
      const kitchenRegion = k.region?.en?.toLowerCase() || "";
      const targetRegion = selectedRegion.toLowerCase();
      return kitchenRegion === targetRegion;
    });
  }, [selectedRegion, kitchens]);

  return (
    <div className="w-full max-w-6xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      
      <nav className="flex flex-wrap gap-2 mb-12 justify-center" aria-label="Region filter">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region.id)}
            className={`px-5 py-2 rounded-2xl font-bold transition-all border-2 ${
              selectedRegion === region.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105"
                : "bg-white text-gray-500 border-gray-100 hover:border-emerald-200"
            }`}
          >
            {isAr ? region.ar : region.en}
          </button>
        ))}
      </nav>

      {filteredKitchens.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">
            {isAr ? "لا توجد مطابخ في هذه المنطقة حالياً." : "No kitchens found in this region."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredKitchens.map((kitchen) => (
            <article
              key={kitchen.id}
              className="bg-white p-7 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-black text-2xl text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight">
                  {kitchen.name[lang] || kitchen.name['en']} 
                </h2>
                <CheckCircle2 className="text-emerald-500 shrink-0" size={22} />
              </div>

              <div className="flex items-center text-gray-500 text-sm mb-6 bg-gray-50 w-fit px-3 py-1 rounded-full">
                <MapPin size={14} className={`${isAr ? 'ml-1' : 'mr-1'} text-emerald-500`} />
                <span className="font-bold">
                  {kitchen.region[lang] || kitchen.region['en']}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-sm">
                  <Clock size={18} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      {isAr ? "وقت التوزيع" : "Distribution Time"}
                    </p>
                    <p className="text-gray-800 font-bold">{kitchen.distributionTime[lang]}</p>
                  </div>
                </div>

                <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100/50">
                  <span className="text-amber-700 text-[10px] font-black uppercase block mb-1">
                    {isAr ? "وجبة اليوم" : "Today's Menu"}
                  </span>
                  <p className="text-amber-900 font-black text-lg">{kitchen.todaysMeal[lang]}</p>
                </div>
              </div>

              
              <div className="mt-auto pt-6 border-t border-gray-50">
                <MealRegistration 
                  kitchenId={kitchen.id} 
                  capacity={kitchen.capacity || 500} 
                  initialCount={kitchen._count?.orders || 0} 
                  lang={lang} 
                />
              </div>

              {kitchen.contact && (
                <a 
                  href={`tel:${kitchen.contact}`}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm"
                >
                  <PhoneCall size={16} />
                  <span dir="ltr">{kitchen.contact}</span>
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}