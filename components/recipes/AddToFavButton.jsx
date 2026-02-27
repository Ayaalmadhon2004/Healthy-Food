"use client";
import { Heart } from "lucide-react";
import { useFavStore } from "@/store/useFavStore";

export default function AddToFavButton({ meal }) {
  const { favItems, toggleFavorite } = useFavStore();
  const isFav = favItems.some((i) => i.id === meal.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(meal);
      }}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 border ${
        isFav 
          ? "bg-red-50 text-red-500 border-red-100 shadow-sm" 
          : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-white hover:border-red-200"
      } active:scale-95`}
    >
      <Heart 
        size={20} 
        fill={isFav ? "currentColor" : "none"} 
        className={`transition-transform ${isFav ? "scale-110 animate-pulse" : ""}`} 
      />
    </button>
  );
}