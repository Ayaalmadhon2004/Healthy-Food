"use client";

import { useState } from "react";
import { Plus, X, Utensils, MapPin, Clock } from "lucide-react";
import { addKitchenAction } from "@/app/actions/kitchenActions";

export default function AddKitchenModal({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = {
    ar: {
      btn: "إضافة مطبخ جديد",
      title: "إضافة مطبخ ميداني",
      nameAr: "اسم المطبخ (بالعربية)",
      nameEn: "اسم المطبخ (بالإنجليزية)",
      regionAr: "المنطقة (بالعربية)",
      regionEn: "المنطقة (بالإنجليزية)",
      mealAr: "وجبة اليوم (بالعربية)",
      mealEn: "وجبة اليوم (بالإنجليزية)",
      timeAr: "وقت التوزيع (بالعربية)",
      timeEn: "وقت التوزيع (بالإنجليزية)",
      save: "حفظ المطبخ",
      cancel: "إلغاء"
    },
    en: {
      btn: "Add New Kitchen",
      title: "Add Field Kitchen",
      nameAr: "Kitchen Name (Arabic)",
      nameEn: "Kitchen Name (English)",
      regionAr: "Region (Arabic)",
      regionEn: "Region (English)",
      mealAr: "Today's Meal (Arabic)",
      mealEn: "Today's Meal (English)",
      timeAr: "Time (Arabic)",
      timeEn: "Time (English)",
      save: "Save Kitchen",
      cancel: "Cancel"
    }
  }[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    const result = await addKitchenAction(formData);
    
    if (result.success) {
      setIsOpen(false);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
      >
        <Plus size={20} />
        {t.btn}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Utensils className="text-[var(--color-primary)]" />
                {t.title}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.nameAr}</label>
                <input name="nameAr" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.nameEn}</label>
                <input name="nameEn" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.regionAr}</label>
                <input name="regionAr" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.regionEn}</label>
                <input name="regionEn" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>


              <div className="md:col-span-2 flex gap-4 mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[var(--color-primary)] text-white p-4 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "..." : t.save}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-8 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}