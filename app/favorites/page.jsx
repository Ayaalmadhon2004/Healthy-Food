"use client";

import { useFavStore } from "@/store/useFavStore";
import { useLanguage } from "@/context/LanguageContext";
import { useUserData } from "@/hooks/useUserData";
import { Heart, Trash2 } from "lucide-react"; // استيراد أيقونة السلة
import Image from "next/image";

export default function FavoritesPage() {
  const { lang } = useLanguage();
  const { user } = useUserData();
  const favItems = useFavStore((state) => state.favItems);
  const toggleFavorite = useFavStore((state) => state.toggleFavorite);

  const isRtl = lang === "ar";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12" dir={isRtl ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-black mb-8">
        {isRtl ? "وصفاتي المفضلة" : "My Favorite Recipes"}
      </h1>

      {favItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Heart className="mx-auto mb-4 opacity-20" size={80} />
          <p className="text-xl">{isRtl ? "لم تقم بإضافة أي وصفات بعد" : "No favorites added yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl border overflow-hidden hover:shadow-xl transition-all relative">
              
              {/* زر الحذف السريع - سلة المهملات */}
              <button 
                onClick={() => toggleFavorite(item, user?.id)}
                className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-lg hover:bg-red-50 transition-colors"
                title={isRtl ? "حذف من المفضلات" : "Remove from favorites"}
              >
                <Trash2 size={20} />
              </button>

              <div className="relative h-64">
                <Image 
                   src={item.img} 
                   alt={item.title[lang]} 
                   fill 
                   className="object-cover transition-transform group-hover:scale-105" 
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{item.title[lang]}</h3>
                <div className="flex gap-4 text-sm text-gray-500">
                   <span>{item.time?.[lang]}</span>
                   <span>{item.cal?.[lang]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}