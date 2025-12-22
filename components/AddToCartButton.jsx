"use client";

import { useCartStore } from "@/store/cartStore";

export default function AddToCartButton({ meal, className = "" }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button
      onClick={() => addToCart({ id: meal.id, name: meal.title, calories: meal.cal })}
      className={`shadow-xl rounded-xl p-4 cursor-pointer bg-[var(--color-primary)] font-bold text-[var(--color-white)] ${className}`}
    >
      Add to Cart
    </button>
  );
}
