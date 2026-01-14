"use client";

import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingCart, Plus } from "lucide-react"; 

export default function AddToCartButton({ meal, className = "" }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { lang } = useLanguage();

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    
    addToCart({ 
      id: meal.id, 
      name: meal.title,    
      calories: meal.cal,  
      img: meal.img,       
      quantity: 1 
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`shadow-md rounded-xl p-3 cursor-pointer bg-green-600 hover:bg-green-700 transition-all active:scale-95 font-bold text-white flex items-center justify-center gap-2 ${className}`}
    >
      <div className="relative">
        <ShoppingCart size={20} />
        <Plus size={12} className="absolute -top-1 -right-1 bg-green-600 rounded-full" />
      </div>
      {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
    </button>
  );
}