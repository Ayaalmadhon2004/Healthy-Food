"use client";

import { useState } from "react";
import { Edit3, MapPin, Clock, Search, Trash2, Utensils } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { deleteKitchenAction } from "@/app/actions/kitchenActions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function OrgKitchenTable({ initialKitchens = [] }) {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const t = {
    ar: {
      searchPlaceholder: "ابحث عن مطبخ أو منطقة...",
      kitchen: "المطبخ",
      region: "المنطقة",
      meal: "وجبة اليوم",
      time: "الوقت",
      actions: "إجراءات",
      noResults: "لا توجد نتائج مطابقة",
      confirmDelete: "هل أنت متأكد من حذف هذا المطبخ؟",
      cancel: "إلغاء",
      delete: "نعم، احذف",
      deleting: "جاري الحذف...",
      deleted: "تم حذف المطبخ بنجاح"
    },
    en: {
      searchPlaceholder: "Search kitchen or region...",
      kitchen: "Kitchen",
      region: "Region",
      meal: "Today's Meal",
      time: "Time",
      actions: "Actions",
      noResults: "No matching results found",
      confirmDelete: "Are you sure you want to delete this kitchen?",
      cancel: "Cancel",
      delete: "Yes, Delete",
      deleting: "Deleting...",
      deleted: "Deleted successfully"
    }
  };

  const currentT = t[lang] || t.ar;

  // منطق البحث (Client-side filtering)
  const filtered = initialKitchens.filter(k => 
    k.name[lang]?.toLowerCase().includes(search.toLowerCase()) ||
    k.region[lang]?.toLowerCase().includes(search.toLowerCase())
  );

  // وظيفة الحذف مع التأكيد (Custom Toast Confirmation)
  const handleDelete = (id) => {
    toast((tId) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-gray-800 text-sm">{currentT.confirmDelete}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(tId.id)}
            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
          >
            {currentT.cancel}
          </button>
          <button
            onClick={() => {
              toast.dismiss(tId.id);
              executeDelete(id);
            }}
            className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm transition-all"
          >
            {currentT.delete}
          </button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" });
  };

  const executeDelete = async (id) => {
    const loadingToast = toast.loading(currentT.deleting);
    try {
      const result = await deleteKitchenAction(id);
      if (result.success) {
        toast.success(currentT.deleted, { id: loadingToast });
        router.refresh(); 
      } else {
        toast.error(result.error || "Error", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Error", { id: loadingToast });
    }
  };

  return (
    <div className="w-full font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* شريط البحث */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={currentT.searchPlaceholder}
          className="bg-transparent border-none outline-none w-full font-medium placeholder:text-gray-300 text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${lang === "ar" ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="bg-gray-50/80 text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
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
                <tr key={kitchen.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="font-bold text-gray-900 leading-tight">
                      {kitchen.name[lang]}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-[var(--color-primary)] opacity-70" /> 
                      {kitchen.location?.[lang] || "---"}
                    </div>
                  </td>

                  <td className="p-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      {kitchen.region[lang]}
                    </span>
                  </td>

                  <td className="p-6">
                    <div className="font-semibold text-gray-600 text-sm flex items-center gap-2">
                      <Utensils size={14} className="text-orange-400" />
                      {kitchen.todaysMeal?.[lang] || "---"}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                      <Clock size={14} className="text-gray-300" /> 
                      {kitchen.distributionTime?.[lang] || "---"}
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/dashboard/organization/${kitchen.id}/edit`}
                        className="p-3 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-sm transition-all active:scale-95"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(kitchen.id)}
                        className="p-3 bg-white border border-gray-100 text-red-400 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all active:scale-95 shadow-sm hover:shadow-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-300 font-medium italic">
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