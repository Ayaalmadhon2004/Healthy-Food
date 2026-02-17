"use client";

import { useState } from "react";
import { Plus, X, Utensils, MapPin, Clock, Salad } from "lucide-react";
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
      timeAr: "Distribution Time (Arabic)",
      timeEn: "Distribution Time (English)",
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
      e.target.reset();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Utensils size={12} /> {t.nameAr}
                </label>
                <input name="nameAr" required className="form-input" placeholder="مثال: مطبخ الأمل" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Utensils size={12} /> {t.nameEn}
                </label>
                <input name="nameEn" required className="form-input" placeholder="e.g. Al-Amal Kitchen" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={12} /> {t.regionAr}
                </label>
                <input name="regionAr" required className="form-input" placeholder="مثال: دير البلح" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={12} /> {t.regionEn}
                </label>
                <input name="regionEn" required className="form-input" placeholder="e.g. Deir al-Balah" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Salad size={12} /> {t.mealAr}
                </label>
                <input name="mealAr" required className="form-input" placeholder="مثال: أرز مع دجاج" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Salad size={12} /> {t.mealEn}
                </label>
                <input name="mealEn" required className="form-input" placeholder="e.g. Rice with Chicken" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} /> {t.timeAr}
                </label>
                <input name="timeAr" required className="form-input" placeholder="مثال: 12:00 ظهراً" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} /> {t.timeEn}
                </label>
                <input name="timeEn" required className="form-input" placeholder="e.g. 12:00 PM" />
              </div>

              <div className="md:col-span-2 flex gap-4 mt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[var(--color-primary)] text-white p-4 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-orange-200"
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

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 1rem;
          background-color: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 0.75rem;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: var(--color-primary, #fb923c);
          background-color: white;
          box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.1);
        }
      `}</style>
    </>
  );
}