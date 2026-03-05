"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateKitchenAction } from "@/app/actions/kitchenActions";
import { Save, Utensils, MapPin, Clock, Globe, Users, Phone, ChevronDown } from "lucide-react";

// نفس المصفوفة الموحدة للمناطق
const REGION_OPTIONS = [
  { id: "North", en: "North", ar: "الشمال" },
  { id: "Gaza", en: "Gaza", ar: "غزة" },
  { id: "Middle", en: "Middle", ar: "الوسطى" },
  { id: "Khan Younis", en: "Khan Younis", ar: "خانيونس" },
  { id: "Rafah", en: "Rafah", ar: "رفح" },
];

export default function EditKitchenForm({ kitchen, lang }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isAr = lang === "ar";

  const t = {
    ar: {
      kitchenName: "اسم المطبخ",
      region: "المنطقة",
      meal: "وجبة اليوم",
      time: "وقت التوزيع",
      capacity: "السعة (عدد الوجبات)",
      contact: "رقم التواصل",
      save: "حفظ التعديلات",
      cancel: "إلغاء",
      arabic: "بالعربية",
      english: "بالإنجليزية",
      selectRegion: "اختر المنطقة من القائمة...",
      phNameAr: "أدخل اسم المطبخ بالعربي...",
      phNameEn: "Enter name in English...",
      phMealAr: "وصف الوجبة بالعربي...",
      phMealEn: "Meal in English...",
      phCapacity: "مثلاً: 500",
      phContact: "059XXXXXXXX"
    },
    en: {
      kitchenName: "Kitchen Name",
      region: "Region",
      meal: "Today's Meal",
      time: "Distribution Time",
      capacity: "Capacity (Meals)",
      contact: "Contact Number",
      save: "Save Changes",
      cancel: "Cancel",
      arabic: "In Arabic",
      english: "In English",
      selectRegion: "Select a region...",
      phNameAr: "Enter name in Arabic...",
      phNameEn: "Enter name in English...",
      phMealAr: "Meal description in Arabic...",
      phMealEn: "Meal in English...",
      phCapacity: "e.g. 500",
      phContact: "059XXXXXXXX"
    }
  }[lang];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const result = await updateKitchenAction(kitchen.id, formData);

    if (result.success) {
      router.push("/dashboard/organization"); 
      router.refresh(); 
    } else {
      alert(isAr ? "حدث خطأ أثناء التحديث" : "Error updating kitchen");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white" dir={isAr ? "rtl" : "ltr"}>
      
      {/* قسم الاسم */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-700 border-b pb-2">
          <Utensils size={18} className="text-orange-500" />
          {t.kitchenName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold">{t.arabic}</label>
            <input name="nameAr" defaultValue={kitchen.name?.ar} placeholder={t.phNameAr} required className="form-input-custom" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold">{t.english}</label>
            <input name="nameEn" defaultValue={kitchen.name?.en} placeholder={t.phNameEn} required className="form-input-custom text-left" dir="ltr" />
          </div>
        </div>
      </section>

      {/* قسم السعة والتواصل (تصميم مميز) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100/50">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-bold text-gray-600 text-sm">
            <Users size={16} className="text-emerald-600" />
            {t.capacity}
          </label>
          <input 
            type="number" 
            name="capacity" 
            defaultValue={kitchen.capacity} 
            placeholder={t.phCapacity} 
            className="form-input-custom !bg-white" 
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-bold text-gray-600 text-sm">
            <Phone size={16} className="text-blue-600" />
            {t.contact}
          </label>
          <input 
            type="text" 
            name="contact" 
            defaultValue={kitchen.contact} 
            placeholder={t.phContact} 
            className="form-input-custom !bg-white text-left" 
            dir="ltr"
          />
        </div>
      </section>

      {/* قسم المنطقة والوجبة والوقت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* المنطقة - Dropdown */}
         <div className="space-y-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2"><MapPin size={16}/> {t.region}</h4>
            <div className="relative group">
              <select 
                name="regionId" 
                required 
                className="form-input-custom appearance-none cursor-pointer pr-10"
                defaultValue={kitchen.region?.en} // نفترض أن الـ ID المخزن هو القيمة الإنجليزية
              >
                <option value="">{t.selectRegion}</option>
                {REGION_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {isAr ? opt.ar : opt.en}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-emerald-600 transition-colors`} />
            </div>
         </div>

         {/* الوجبة */}
         <div className="space-y-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2"><Globe size={16}/> {t.meal}</h4>
            <input name="mealAr" defaultValue={kitchen.todaysMeal?.ar} placeholder={t.phMealAr} className="form-input-custom mb-2" />
            <input name="mealEn" defaultValue={kitchen.todaysMeal?.en} placeholder={t.phMealEn} className="form-input-custom text-left" dir="ltr" />
         </div>

         {/* الوقت */}
         <div className="space-y-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2"><Clock size={16}/> {t.time}</h4>
            <input name="timeAr" defaultValue={kitchen.distributionTime?.ar} placeholder={isAr ? "مثلاً: 1:00 ظهرًا" : "e.g. 1:00 PM"} className="form-input-custom mb-2" />
            <input name="timeEn" defaultValue={kitchen.distributionTime?.en} placeholder="e.g. 1:00 PM" className="form-input-custom text-left" dir="ltr" />
         </div>
      </div>

      {/* الأزرار */}
      <div className="flex items-center gap-4 pt-8 border-t">
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? "..." : t.save}
        </button>
        <button 
          type="button"
          onClick={() => router.push("/dashboard/organization")}
          className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
        >
          {t.cancel}
        </button>
      </div>

      <style jsx>{`
        .form-input-custom {
          width: 100%;
          padding: 0.8rem 1rem;
          background-color: #f9fafb;
          border: 1.5px solid #f3f4f6;
          border-radius: 1rem;
          outline: none;
          transition: all 0.2s;
          font-weight: 500;
        }
        .form-input-custom:focus {
          border-color: #10b981;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </form>
  );
}