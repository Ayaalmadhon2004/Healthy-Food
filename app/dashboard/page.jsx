"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardHome() {
  const { lang } = useLanguage();
  const userName = "User"; 

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          {lang === "ar" ? `مرحباً بك، ${userName}!` : `Welcome back, ${userName}!`}
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          {lang === "ar" 
            ? "إليك ما يحدث في خطتك الصحية اليوم." 
            : "Here's what's happening with your health plan today."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-40 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400">
          Stat Card Placeholder
        </div>
      </div>
    </div>
  );
}