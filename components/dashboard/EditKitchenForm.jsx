"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateKitchenAction } from "@/app/actions/kitchenActions";
import { Save, Utensils, MapPin, Clock, Globe } from "lucide-react";

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
      save: "حفظ التعديلات",
      cancel: "إلغاء",
      arabic: "بالعربية",
      english: "بالإنجليزية"
    },
    en: {
      kitchenName: "Kitchen Name",
      region: "Region",
      meal: "Today's Meal",
      time: "Distribution Time",
      save: "Save Changes",
      cancel: "Cancel",
      arabic: "In Arabic",
      english: "In English"
    }
  }[lang];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const result = await updateKitchenAction(kitchen.id, formData);

    if (result.success) {
      router.push("/organization"); 
      router.refresh(); 
    } else {
      alert(isAr ? "حدث خطأ أثناء التحديث" : "Error updating kitchen");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white" dir={isAr ? "rtl" : "ltr"}>
      
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-700 border-b pb-2">
          <Utensils size={18} className="text-orange-500" />
          {t.kitchenName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">{t.arabic}</label>
            <input name="nameAr" defaultValue={kitchen.name?.ar} required className="form-input-custom" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">{t.english}</label>
            <input name="nameEn" defaultValue={kitchen.name?.en} required className="form-input-custom" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-700 border-b pb-2">
          <MapPin size={18} className="text-blue-500" />
          {t.region}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="regionAr" defaultValue={kitchen.region?.ar} placeholder={t.arabic} required className="form-input-custom" />
          <input name="regionEn" defaultValue={kitchen.region?.en} placeholder={t.english} required className="form-input-custom" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-700 border-b pb-2">
          <Globe size={18} className="text-green-500" />
          {t.meal}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="mealAr" defaultValue={kitchen.todaysMeal?.ar} placeholder={t.arabic} required className="form-input-custom" />
          <input name="mealEn" defaultValue={kitchen.todaysMeal?.en} placeholder={t.english} required className="form-input-custom" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-700 border-b pb-2">
          <Clock size={18} className="text-purple-500" />
          {t.time}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="timeAr" defaultValue={kitchen.distributionTime?.ar} placeholder={t.arabic} required className="form-input-custom" />
          <input name="timeEn" defaultValue={kitchen.distributionTime?.en} placeholder={t.english} required className="form-input-custom" />
        </div>
      </section>

      <div className="flex items-center gap-4 pt-6 border-t">
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? "..." : t.save}
        </button>
        <button 
          type="button"
          onClick={() => router.back()}
          className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
        >
          {t.cancel}
        </button>
      </div>

      <style jsx>{`
        .form-input-custom {
          width: 100%;
          padding: 1rem;
          background-color: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 0.75rem;
          outline: none;
          transition: all 0.2s;
        }
        .form-input-custom:focus {
          border-color: #fb923c;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.1);
        }
      `}</style>
    </form>
  );
}