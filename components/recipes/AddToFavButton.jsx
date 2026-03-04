"use client";
import { Heart } from "lucide-react";
import { useFavStore } from "@/store/useFavStore";
import { useUserData } from "@/hooks/useUserData";

export default function AddToFavButton({ meal }) {
  const { user } = useUserData();
  
  // استخدام Selector يضمن تحديث الزر فور تغير favItems في المتجر
  const favItems = useFavStore((state) => state.favItems);
  const toggleFavorite = useFavStore((state) => state.toggleFavorite);
  
  // التحقق المباشر من القائمة المدمجة
  const isFavorite = favItems.some((item) => item.id === meal.id);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // إرسال الوجبة وUserId للمزامنة مع السيرفر
    await toggleFavorite(meal, user?.id);
  };

  return (
    <button
      onClick={handleToggle}
      className={`w-12 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-90 ${
        isFavorite 
          ? "bg-red-50 border-red-100 text-red-500 shadow-sm" 
          : "bg-gray-50 border-gray-100 text-gray-400 hover:text-red-400"
      }`}
    >
      <Heart 
        size={20} 
        className={isFavorite ? "fill-current" : ""} 
        strokeWidth={isFavorite ? 2.5 : 2}
      />
    </button>
  );
}