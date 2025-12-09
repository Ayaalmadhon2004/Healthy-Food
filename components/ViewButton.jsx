"use client";
import { useRouter } from "next/navigation";

export default function ViewButton({ id }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/recipes/${id}`)}
      className="mt-4 bg-[var(--color-primary)] text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors text-sm sm:text-base"
    >
      View Recipe
    </button>
  );
}
