"use client";
import { useRouter } from "next/navigation";

export default function LogMealButton({ calory, mealName }: { calory: number | string; mealName: string }) {
    const router=useRouter();
    const handleClick = () => {
    router.push(`/tracker?meal=${encodeURIComponent(mealName)}&cal=${encodeURIComponent(String(calory))}`);
  };
  return (
    <button 
      onClick={handleClick}
      className="w-full md:w-auto shadow-xl rounded-xl p-4 cursor-pointer bg-[var(--color-primary)] font-bold text-[var(--color-white)] "
    >
    Log this meals
    </button>
  );
}
