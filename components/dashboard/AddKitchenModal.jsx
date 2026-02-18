"use client";

import { useState } from "react";
import { Plus, X, Utensils, MapPin, Clock, Salad } from "lucide-react";
import { addKitchenAction } from "@/app/actions/kitchenActions";
import { useRouter } from "next/navigation";

export default function AddKitchenModal({ lang = "ar" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // نظام ترجمة آمن يمنع خطأ undefined
  const translations = {
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
  };

  // اختيار الترجمة بناءً على اللغة الممرة أو الافتراض للعربية
  const t = translations[lang] || translations.ar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    try {
      const result = await addKitchenAction(formData);
      if (result.success) {
        setIsOpen(false);
        e.target.reset();
        router.refresh(); // لتحديث الجدول فوراً بعد الإضافة
      }
    } catch (error) {
      console.error("Error adding kitchen:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* الزر الذي يفتح المودال */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg active:scale-95 text-sm"
      >
        <Plus size={20} />
        {t.btn}
      </button>

      {/* النافذة المنبثقة (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            
            {/* الرأس */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black flex items-center gap-2 text-gray-800">
                <Utensils className="text-green-600" />
                {t.title}
              </h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* النموذج */}
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* حقول الاسم */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Utensils size={12} /> {t.nameAr}
                </label>
                <input name="nameAr" required className="form-input" placeholder="مثال: مطبخ الأمل" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Utensils size={12} /> {t.nameEn}
                </label>
                <input name="nameEn" required className="form-input" placeholder="e.g. Al-Amal Kitchen" />
              </div>

              {/* حقول المنطقة */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> {t.regionAr}
                </label>
                <input name="regionAr" required className="form-input" placeholder="مثال: دير البلح" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> {t.regionEn}
                </label>
                <input name="regionEn" required className="form-input" placeholder="e.g. Deir al-Balah" />
              </div>

              {/* حقول الوجبة */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Salad size={12} /> {t.mealAr}
                </label>
                <input name="mealAr" required className="form-input" placeholder="مثال: أرز مع دجاج" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Salad size={12} /> {t.mealEn}
                </label>
                <input name="mealEn" required className="form-input" placeholder="e.g. Rice with Chicken" />
              </div>

              {/* حقول الوقت */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> {t.timeAr}
                </label>
                <input name="timeAr" required className="form-input" placeholder="مثال: 12:00 ظهراً" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> {t.timeEn}
                </label>
                <input name="timeEn" required className="form-input" placeholder="e.g. 12:00 PM" />
              </div>

              {/* أزرار التحكم */}
              <div className="md:col-span-2 flex gap-3 mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-100"
                >
                  {loading ? "..." : t.save}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-8 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* تنسيقات CSS مدمجة للـ Input */}
      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 0.85rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 1rem;
          outline: none;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: #16a34a;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.05);
        }
      `}</style>
    </>
  );
}