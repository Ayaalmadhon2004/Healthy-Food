"use client";

import { useState, type FormEvent } from "react";
import type { Localized } from "@/lib/types";
import { parseCapacity } from "@/lib/capacity";
import ImagePreview from "@/components/dashboard/ImagePreview";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { updateKitchenAction } from "@/app/actions/kitchenActions";
import { Save, Utensils, MapPin, Clock, Globe, Users, Phone, ChevronDown, ImageIcon } from "lucide-react";

// نفس المصفوفة الموحدة للمناطق
const REGION_OPTIONS = [
  { id: "North", en: "North", ar: "الشمال" },
  { id: "Gaza", en: "Gaza", ar: "غزة" },
  { id: "Middle", en: "Middle", ar: "الوسطى" },
  { id: "Khan Younis", en: "Khan Younis", ar: "خانيونس" },
  { id: "Rafah", en: "Rafah", ar: "رفح" },
];

export interface EditableKitchen {
  id: number;
  name?: Partial<Localized> | null;
  region?: Partial<Localized> | null;
  todaysMeal?: Partial<Localized> | null;
  distributionTime?: Partial<Localized> | null;
  contact?: string;
  image?: string | null;
  capacity?: unknown;
}

export default function EditKitchenForm({ kitchen, lang }: { kitchen: EditableKitchen; lang: string }) {
  const router = useRouter();
  const { path } = useLanguage();
  const [loading, setLoading] = useState(false);

  const isAr = lang === "ar";
  const [imageValue, setImageValue] = useState(kitchen.image ?? "");

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
      phContact: "059XXXXXXXX",
      photo: "رابط الصورة (اختياري)",
      photoHint: "رابط https:// أو مسار يبدأ بـ /assets/. اتركه فارغاً لعرض الرسم التوضيحي.",
      photoPreview: "معاينة الصورة"
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
      phContact: "059XXXXXXXX",
      photo: "Photo link (optional)",
      photoHint: "An https:// link or a path starting with /assets/. Leave empty to show the illustration.",
      photoPreview: "Photo preview"
    }
  }[lang as "ar" | "en"];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateKitchenAction(kitchen.id, formData);

    if (result.success) {
      router.push(path("/dashboard/organization"));
      router.refresh(); 
    } else {
      alert(result.error || (isAr ? "حدث خطأ أثناء التحديث" : "Error updating kitchen"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white" dir={isAr ? "rtl" : "ltr"}>
      
      {/* قسم الاسم */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-700 border-b pb-2">
          <Utensils size={18} className="text-clay-600" />
          {t.kitchenName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="edit-kitchen-nameAr" className="text-xs text-ink-mute font-bold">{t.arabic}</label>
            <input id="edit-kitchen-nameAr" name="nameAr" defaultValue={kitchen.name?.ar} placeholder={t.phNameAr} required className="form-input-custom" />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-kitchen-nameEn" className="text-xs text-ink-mute font-bold">{t.english}</label>
            <input id="edit-kitchen-nameEn" name="nameEn" defaultValue={kitchen.name?.en} placeholder={t.phNameEn} required className="form-input-custom text-left" dir="ltr" />
          </div>
        </div>
      </section>

      {/* قسم السعة والتواصل (تصميم مميز) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/30 p-6 rounded-xl border border-emerald-100/50">
        <div className="space-y-2">
          <label htmlFor="edit-kitchen-capacity" className="flex items-center gap-2 font-bold text-gray-600 text-sm">
            <Users size={16} className="text-olive-700" />
            {t.capacity}
          </label>
          <input 
            type="number" 
            id="edit-kitchen-capacity" name="capacity" 
            defaultValue={parseCapacity(kitchen.capacity) ?? ""} min="1" required 
            placeholder={t.phCapacity} 
            className="form-input-custom !bg-white" 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="edit-kitchen-contact" className="flex items-center gap-2 font-bold text-gray-600 text-sm">
            <Phone size={16} className="text-sea-700" />
            {t.contact}
          </label>
          <input 
            type="text" 
            id="edit-kitchen-contact" name="contact" 
            defaultValue={kitchen.contact} 
            placeholder={t.phContact} 
            className="form-input-custom !bg-white text-left" 
            dir="ltr"
          />
        </div>
      </section>

      {/* الصورة */}
      <section className="space-y-2">
        <label htmlFor="edit-kitchen-image" className="flex items-center gap-2 font-bold text-gray-600 text-sm">
          <ImageIcon size={16} className="text-sea-700" aria-hidden="true" />
          {t.photo}
        </label>
        <input
          type="text"
          id="edit-kitchen-image" name="image"
          value={imageValue}
          onChange={(e) => setImageValue(e.target.value)}
          maxLength={500}
          aria-describedby="edit-kitchen-image-hint"
          placeholder="https://..."
          className="form-input-custom text-left"
          dir="ltr"
        />
        <p id="edit-kitchen-image-hint" className="text-xs text-ink-mute">{t.photoHint}</p>
        <ImagePreview value={imageValue} alt={t.photoPreview} />
      </section>

      {/* قسم المنطقة والوجبة والوقت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* المنطقة - Dropdown */}
         <div className="space-y-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2"><MapPin size={16}/> {t.region}</h4>
            <div className="relative group">
              <select 
                name="regionId" 
                aria-label={t.region}
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
              <ChevronDown size={18} className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none group-hover:text-olive-700 transition-colors`} />
            </div>
         </div>

         {/* الوجبة */}
         <div className="space-y-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2"><Globe size={16}/> {t.meal}</h4>
            <input name="mealAr" defaultValue={kitchen.todaysMeal?.ar} aria-label={t.meal} placeholder={t.phMealAr} className="form-input-custom mb-2" />
            <input name="mealEn" defaultValue={kitchen.todaysMeal?.en} aria-label={t.meal} placeholder={t.phMealEn} className="form-input-custom text-left" dir="ltr" />
         </div>

         {/* الوقت */}
         <div className="space-y-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2"><Clock size={16}/> {t.time}</h4>
            <input aria-label={t.time} name="timeAr" defaultValue={kitchen.distributionTime?.ar} placeholder={isAr ? "مثلاً: 1:00 ظهرًا" : "e.g. 1:00 PM"} className="form-input-custom mb-2" />
            <input aria-label={t.time} name="timeEn" defaultValue={kitchen.distributionTime?.en} placeholder="e.g. 1:00 PM" className="form-input-custom text-left" dir="ltr" />
         </div>
      </div>

      {/* الأزرار */}
      <div className="flex items-center gap-4 pt-8 border-t">
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-4 rounded-lg font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-100 disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? "..." : t.save}
        </button>
        <button 
          type="button"
          onClick={() => router.push(path("/dashboard/organization"))}
          className="px-8 py-4 bg-gray-100 text-ink-mute rounded-lg font-bold hover:bg-gray-200 transition-all"
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