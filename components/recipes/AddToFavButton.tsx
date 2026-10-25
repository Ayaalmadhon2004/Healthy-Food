"use client";
import { Heart } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { useFavStore, type FavItem } from "@/store/useFavStore";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/context/LanguageContext";

export default function AddToFavButton({ meal }: { meal: FavItem }) {
  const { user } = useUserData();
  const { lang } = useLanguage();
  const [pop, setPop] = useState(false);

  // استخدام Selector يضمن تحديث الزر فور تغير favItems في المتجر
  const favItems = useFavStore((state) => state.favItems);
  const toggleFavorite = useFavStore((state) => state.toggleFavorite);

  // التحقق المباشر من القائمة المدمجة
  const isFavorite = favItems.some((item) => item.id === meal.id);

  const handleToggle = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPop(!isFavorite);

    // إرسال الوجبة وUserId للمزامنة مع السيرفر
    await toggleFavorite(meal, user?.id);
  };

  const label = isFavorite
    ? (lang === "ar" ? "إزالة من المفضلة" : "Remove from favorites")
    : (lang === "ar" ? "أضف إلى المفضلة" : "Add to favorites");

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-lg border transition-colors ${
        isFavorite
          ? "bg-clay-50 border-clay-300 text-clay-700"
          : "bg-white border-line-strong text-ink-mute hover:text-clay-700 hover:border-clay-300"
      }`}
    >
      <Heart
        size={19}
        strokeWidth={1.75}
        className={`${isFavorite ? "fill-current" : ""} ${pop && isFavorite ? "heart-pop" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}
