"use client";

import { X, Heart, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useFavStore } from "@/store/useFavStore";
import { useLanguage } from "@/context/LanguageContext";
import { useUserData } from "@/hooks/useUserData"; 
import Image from "next/image";
import Link from "next/link";

export default function FavModal() {
  const { lang } = useLanguage();
  const { user } = useUserData(); // جلب بيانات المستخدم "moh"
  const isRtl = lang === "ar";

  const favItems = useFavStore((state) => state.favItems);
  const toggleFavorite = useFavStore((state) => state.toggleFavorite);
  const isFavOpen = useFavStore((state) => state.isFavOpen); 
  const closeFav = useFavStore((state) => state.closeFav);

  if (!isFavOpen) return null;

  const t = {
    title: { en: "My Favorites", ar: "وصفاتي المفضلة" },
    empty: { en: "No favorites yet", ar: "قائمة المفضلة فارغة" },
    viewAll: { en: "View All Favorites", ar: "عرض كل المفضلة" },
    remove: { en: "Remove", ar: "إزالة" },
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm flex justify-end z-[100]">
      <div 
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={24} />
            {t.title[lang]}
          </h2>
          <button onClick={closeFav} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {favItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <Heart size={40} strokeWidth={1} />
              <p className="font-bold">{t.empty[lang]}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {favItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-gray-50 hover:bg-red-50/30 transition-all group">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                    <Image src={item.img} alt={item.title[lang]} fill className="object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-bold text-gray-900 line-clamp-1 text-sm">{item.title[lang]}</p>
                    <button 
                      // نمرر الـ user.id هنا لضمان الحذف من Prisma أيضاً
                      onClick={() => toggleFavorite(item, user?.id)} 
                      className="text-red-400 hover:text-red-600 text-[11px] font-bold flex items-center gap-1 mt-2"
                    >
                      <Trash2 size={12} />
                      {t.remove[lang]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Link 
            href="/favorites"
            onClick={closeFav}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            {t.viewAll[lang]}
            {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </Link>
        </div>
      </div>
    </div>
  );
}