"use client";
import { useRouter } from "next/navigation";

export default function LogMealButton({calory,mealName}) {
    const router=useRouter();
    const handleClick = () => {
    router.push(`/tracker?meal=${mealName}&cal=${calory}`);
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
