"use client";

import { useState } from "react";
import { Plus, X, Utensils, MapPin, Clock, Salad, AlertCircle, Users, Phone, ChevronDown } from "lucide-react";
import { addKitchenAction } from "@/app/actions/kitchenActions";
import { useRouter } from "next/navigation";

// يجب أن تطابق هذه المصفوفة تماماً المصفوفة الموجودة في صفحة العرض (Filter)
const REGION_OPTIONS = [
  { id: "North", en: "North", ar: "الشمال" },
  { id: "Gaza", en: "Gaza", ar: "غزة" },
  { id: "Middle", en: "Middle", ar: "الوسطى" },
  { id: "Khan Younis", en: "Khan Younis", ar: "خانيونس" },
  { id: "Rafah", en: "Rafah", ar: "رفح" },
];

export default function AddKitchenModal({ lang = "ar", kitchens = [], onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState(""); 
  const router = useRouter();

  const translations = {
    ar: {
      btn: "إضافة مطبخ جديد",
      title: "إضافة مطبخ ميداني",
      nameAr: "اسم المطبخ (بالعربية)",
      nameEn: "اسم المطبخ (بالإنجليزية)",
      region: "اختر المنطقة",
      mealAr: "وجبة اليوم (بالعربية)",
      mealEn: "وجبة اليوم (بالإنجليزية)",
      timeAr: "وقت التوزيع (بالعربية)",
      timeEn: "وقت التوزيع (بالإنجليزية)",
      capacity: "السعة (عدد الوجبات)",
      contact: "رقم التواصل",
      save: "حفظ المطبخ",
      cancel: "إلغاء",
      duplicateWarn: "هذا الاسم موجود مسبقاً",
      selectRegion: "اختر المنطقة من القائمة..."
    },
    en: {
      btn: "Add New Kitchen",
      title: "Add Field Kitchen",
      nameAr: "Kitchen Name (Arabic)",
      nameEn: "Kitchen Name (English)",
      region: "Select Region",
      mealAr: "Today's Meal (Arabic)",
      mealEn: "Today's Meal (English)",
      timeAr: "Distribution Time (Arabic)",
      timeEn: "Distribution Time (English)",
      capacity: "Capacity (Meals Count)",
      contact: "Contact Number",
      save: "Save Kitchen",
      cancel: "Cancel",
      duplicateWarn: "Name already exists",
      selectRegion: "Select a region..."
    }
  };

  const t = translations[lang] || translations.ar;
  const isAr = lang === "ar";

  const isDuplicate = kitchens.some(k => {
    const existingName = (typeof k.name === 'string' ? k.name : k.name?.ar)?.trim();
    return existingName === nameInput.trim() && nameInput.trim() !== "";
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    // ملاحظة: سنقوم بإرسال الـ ID الخاص بالمنطقة ليتم تخزينه بشكل موحد
    try {
      const result = await addKitchenAction(formData);
      if (result.success) {
        setIsOpen(false);
        setNameInput("");
        e.target.reset();
        if (onSuccess) await onSuccess();
        router.refresh(); 
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg active:scale-95 text-sm"
      >
        <Plus size={20} />
        {t.btn}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black flex items-center gap-2 text-gray-800">
                <Utensils className="text-green-600" /> {t.title}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* اسم المطبخ - عربي */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-1"><Utensils size={12} /> {t.nameAr}</span>
                  {isDuplicate && <span className="text-red-500 animate-pulse">{t.duplicateWarn}</span>}
                </label>
                <input name="nameAr" required className="form-input" placeholder="مثال: مطبخ الأمل" onChange={(e) => setNameInput(e.target.value)} />
              </div>

              {/* اسم المطبخ - إنجليزي */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Utensils size={12} /> {t.nameEn}
                </label>
                <input name="nameEn" required className="form-input" placeholder="e.g. Al-Amal Kitchen" />
              </div>

              {/* المنطقة (قائمة خيارات) */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> {t.region}
                </label>
                <div className="relative group">
                  <select 
                    name="regionId" // نرسل الـ ID للسيرفر ليعرف أي منطقة تم اختيارها
                    required 
                    className="form-input appearance-none cursor-pointer pr-10"
                  >
                    <option value="">{t.selectRegion}</option>
                    {REGION_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {isAr ? opt.ar : opt.en}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-green-600 transition-colors`} />
                </div>
              </div>

              {/* السعة */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Users size={12} /> {t.capacity}
                </label>
                <input type="number" name="capacity" required className="form-input" placeholder="500" />
              </div>

              {/* التواصل */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Phone size={12} /> {t.contact}
                </label>
                <input type="text" name="contact" required className="form-input text-left" dir="ltr" placeholder="059XXXXXXXX" />
              </div>

              {/* وجبة اليوم - عربي وإنجليزي */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Salad size={12} /> {t.mealAr}</label>
                <input name="mealAr" required className="form-input" placeholder="مثال: أرز مع دجاج" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Salad size={12} /> {t.mealEn}</label>
                <input name="mealEn" required className="form-input" placeholder="e.g. Rice with Chicken" />
              </div>

              {/* وقت التوزيع - عربي وإنجليزي */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> {t.timeAr}</label>
                <input name="timeAr" required className="form-input" placeholder="مثال: 12:00 ظهراً" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> {t.timeEn}</label>
                <input name="timeEn" required className="form-input" placeholder="e.g. 12:00 PM" />
              </div>

              <div className="md:col-span-2 flex gap-3 mt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-100">
                  {loading ? "..." : t.save}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="px-8 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200">
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