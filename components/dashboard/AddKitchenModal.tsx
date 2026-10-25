"use client";

import { useEffect, useState, type FormEvent } from "react";
import { pickText, type LocalizedField } from "@/lib/types";
import { Plus, X, Utensils, MapPin, Clock, Salad, Users, Phone, ChevronDown, ImageIcon } from "lucide-react";
import { addKitchenAction } from "@/app/actions/kitchenActions";
import ImagePreview from "@/components/dashboard/ImagePreview";
import { useRouter } from "next/navigation";

// يجب أن تطابق هذه المصفوفة تماماً المصفوفة الموجودة في صفحة العرض (Filter)
const REGION_OPTIONS = [
  { id: "North", en: "North", ar: "الشمال" },
  { id: "Gaza", en: "Gaza", ar: "غزة" },
  { id: "Middle", en: "Middle", ar: "الوسطى" },
  { id: "Khan Younis", en: "Khan Younis", ar: "خانيونس" },
  { id: "Rafah", en: "Rafah", ar: "رفح" },
];

interface AddKitchenModalProps {
  lang?: string;
  kitchens?: { name?: unknown }[];
  onSuccess?: () => void | Promise<void>;
}

export default function AddKitchenModal({ lang = "en", kitchens = [], onSuccess }: AddKitchenModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState(""); 
  const [imageInput, setImageInput] = useState("");
  const [error, setError] = useState("");
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
      selectRegion: "اختر المنطقة من القائمة...",
      photo: "رابط الصورة (اختياري)",
      photoHint: "رابط https:// أو مسار يبدأ بـ /assets/. اتركه فارغاً لعرض الرسم التوضيحي.",
      photoPreview: "معاينة الصورة"
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
      selectRegion: "Select a region...",
      photo: "Photo link (optional)",
      photoHint: "An https:// link or a path starting with /assets/. Leave empty to show the illustration.",
      photoPreview: "Photo preview"
    }
  };

  const t = translations[lang as keyof typeof translations] || translations.ar;

  // Escape closes the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);
  const isAr = lang === "ar";

  const isDuplicate = kitchens.some(k => {
    const existingName = pickText(k.name as LocalizedField, "ar").trim();
    return existingName === nameInput.trim() && nameInput.trim() !== "";
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget; // currentTarget is cleared once the handler awaits
    const formData = new FormData(form);
    
    // ملاحظة: سنقوم بإرسال الـ ID الخاص بالمنطقة ليتم تخزينه بشكل موحد
    try {
      const result = await addKitchenAction(formData);
      if (result.success) {
        setIsOpen(false);
        setNameInput("");
        setImageInput("");
        form.reset();
        if (onSuccess) await onSuccess();
        router.refresh(); 
      } else if (result.error) {
        setError(result.error);
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
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-sm text-sm"
      >
        <Plus size={20} />
        {t.btn}
      </button>

      {isOpen && (
        <div className="modal-backdrop fixed inset-0 z-[999] flex items-center justify-center bg-ink/50 p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" aria-labelledby="add-kitchen-title" className="modal-panel bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 id="add-kitchen-title" className="text-xl font-black flex items-center gap-2 text-gray-800">
                <Utensils className="text-olive-700" /> {t.title}
              </h2>
              <button type="button" aria-label={t.cancel ?? "Close"} onClick={() => setIsOpen(false)} className="p-2 min-w-11 min-h-11 inline-flex items-center justify-center hover:bg-gray-200 rounded-full text-ink-mute">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* اسم المطبخ - عربي */}
              <div className="space-y-2">
                <label htmlFor="add-kitchen-nameAr" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-1"><Utensils size={12} /> {t.nameAr}</span>
                  {isDuplicate && <span className="text-brick-600 animate-pulse">{t.duplicateWarn}</span>}
                </label>
                <input id="add-kitchen-nameAr" name="nameAr" required className="form-input" placeholder="مثال: مطبخ الأمل" onChange={(e) => setNameInput(e.target.value)} />
              </div>

              {/* اسم المطبخ - إنجليزي */}
              <div className="space-y-2">
                <label htmlFor="add-kitchen-nameEn" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1">
                  <Utensils size={12} /> {t.nameEn}
                </label>
                <input id="add-kitchen-nameEn" name="nameEn" required className="form-input" placeholder="e.g. Al-Amal Kitchen" />
              </div>

              {/* المنطقة (قائمة خيارات) */}
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="add-kitchen-regionId" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} /> {t.region}
                </label>
                <div className="relative group">
                  <select 
                    id="add-kitchen-regionId" name="regionId" // نرسل الـ ID للسيرفر ليعرف أي منطقة تم اختيارها
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
                  <ChevronDown size={18} className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none group-hover:text-olive-700 transition-colors`} />
                </div>
              </div>

              {/* السعة */}
              <div className="space-y-2">
                <label htmlFor="add-kitchen-capacity" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1">
                  <Users size={12} /> {t.capacity}
                </label>
                <input type="number" id="add-kitchen-capacity" name="capacity" required min="1" max="100000" step="1" className="form-input" placeholder="500" />
              </div>

              {/* التواصل */}
              <div className="space-y-2">
                <label htmlFor="add-kitchen-contact" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1">
                  <Phone size={12} /> {t.contact}
                </label>
                <input type="text" id="add-kitchen-contact" name="contact" required className="form-input text-left" dir="ltr" placeholder="059XXXXXXXX" />
              </div>

              {/* وجبة اليوم - عربي وإنجليزي */}
              <div className="space-y-2">
                <label htmlFor="add-kitchen-mealAr" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1"><Salad size={12} /> {t.mealAr}</label>
                <input id="add-kitchen-mealAr" name="mealAr" required className="form-input" placeholder="مثال: أرز مع دجاج" />
              </div>
              <div className="space-y-2">
                <label htmlFor="add-kitchen-mealEn" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1"><Salad size={12} /> {t.mealEn}</label>
                <input id="add-kitchen-mealEn" name="mealEn" required className="form-input" placeholder="e.g. Rice with Chicken" />
              </div>

              {/* وقت التوزيع - عربي وإنجليزي */}
              <div className="space-y-2">
                <label htmlFor="add-kitchen-timeAr" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> {t.timeAr}</label>
                <input id="add-kitchen-timeAr" name="timeAr" required className="form-input" placeholder="مثال: 12:00 ظهراً" />
              </div>
              <div className="space-y-2">
                <label htmlFor="add-kitchen-timeEn" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> {t.timeEn}</label>
                <input id="add-kitchen-timeEn" name="timeEn" required className="form-input" placeholder="e.g. 12:00 PM" />
              </div>

              {/* الصورة (اختياري) */}
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="add-kitchen-image" className="text-[10px] font-bold text-ink-mute uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon size={12} aria-hidden="true" /> {t.photo}
                </label>
                <input type="text" id="add-kitchen-image" name="image" value={imageInput} onChange={(e) => setImageInput(e.target.value)} maxLength={500} dir="ltr" aria-describedby="add-kitchen-image-hint" className="form-input text-left" placeholder="https://..." />
                <p id="add-kitchen-image-hint" className="text-xs text-ink-mute">{t.photoHint}</p>
                <ImagePreview value={imageInput} alt={t.photoPreview} />
              </div>

              {error && <p role="alert" className="md:col-span-2 text-sm font-bold text-brick-600">{error}</p>}

              <div className="md:col-span-2 flex gap-3 mt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white p-4 rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm shadow-green-100">
                  {loading ? "..." : t.save}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="px-8 bg-gray-100 text-ink-mute rounded-lg font-bold hover:bg-gray-200">
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