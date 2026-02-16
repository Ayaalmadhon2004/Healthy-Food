"use client";

import { useState } from "react";
import { Edit3, MapPin, Clock, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function OrgKitchenTable({ initialKitchens }) {
    const { lang } = useLanguage();
    const [search, setSearch] = useState("");

  const t = {
    ar: {
      searchPlaceholder: "ابحث عن مطبخ أو منطقة...",
      kitchen: "المطبخ",
      region: "المنطقة",
      meal: "وجبة اليوم",
      time: "الوقت",
      actions: "إجراءات",
      noResults: "لا توجد نتائج مطابقة"
    },
    en: {
      searchPlaceholder: "Search kitchen or region...",
      kitchen: "Kitchen",
      region: "Region",
      meal: "Today's Meal",
      time: "Time",
      actions: "Actions",
      noResults: "No matching results found"
    }
  };

  const currentT = t[lang] || t.ar;

  const filtered = initialKitchens.filter(k => 
    k.name[lang]?.toLowerCase().includes(search.toLowerCase()) ||
    k.region[lang]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={currentT.searchPlaceholder}
          className="bg-transparent border-none outline-none w-full font-medium placeholder:text-gray-300"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${lang === "ar" ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <th className="p-6">{currentT.kitchen}</th>
              <th className="p-6">{currentT.region}</th>
              <th className="p-6">{currentT.meal}</th>
              <th className="p-6">{currentT.time}</th>
              <th className="p-6 text-center">{currentT.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((kitchen) => (
                <tr key={kitchen.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-6">
                    <div className="font-bold text-gray-900 leading-tight">
                      {kitchen.name[lang]}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-gray-300" /> 
                      {kitchen.location[lang]}
                    </div>
                  </td>

                  <td className="p-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                      {kitchen.region[lang]}
                    </span>
                  </td>

                  <td className="p-6">
                    <div className="font-semibold text-gray-700 text-sm italic">
                      {kitchen.todaysMeal[lang]}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                      <Clock size={14} className="text-gray-300" /> 
                      {kitchen.distributionTime[lang]}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex justify-center">
                      <Link
                        href={`/organization/${kitchen.id}/edit`}
                        title={currentT.actions}
                        className="p-3 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-sm transition-all active:scale-95"
                      >
                        <Edit3 size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-400 font-medium">
                  {currentT.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}