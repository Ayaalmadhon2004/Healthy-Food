"use client"; // نحول الـ Layout لـ Client ليتفاعل مع اللغة لحظياً

import Sidebar from "@/components/dashboard/Sidebar";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardLayout({ children }) {
  const { lang } = useLanguage();
  const userRole = "USER"; // يمكنك استبداله بـ Role حقيقي لاحقاً

  return (
    <div 
      className="flex h-screen bg-gray-50" 
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* لم نعد نمرر lang للـ Sidebar لأنه سيجلبها من الـ Context */}
      <Sidebar userRole={userRole} />
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}