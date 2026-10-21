"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function LogMealButton({ calory, mealName }: { calory: number | string; mealName: string }) {
    const router=useRouter();
    const { lang } = useLanguage();
    const handleClick = () => {
    router.push(`/tracker?meal=${encodeURIComponent(mealName)}&cal=${encodeURIComponent(String(calory))}`);
  };
  return (
    <button
      onClick={handleClick}
      className="btn btn-primary !px-5 !py-2.5"
    >
    {lang === "ar" ? "سجّل هذه الوجبة" : "Log this meal"}
    </button>
  );
}
