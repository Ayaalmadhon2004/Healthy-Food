"use client";

import { useEffect, type ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { useLanguage } from "@/context/LanguageContext";
import { useUserData } from "@/hooks/useUserData"; // استيراد الهوك الحقيقي

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  const { user, fetchUser, loading } = useUserData(); // جلب البيانات والحالة

  useEffect(() => {
    // جلب بيانات المستخدم فور تحميل الداشبورد لضمان تحديث الـ Role
    fetchUser();
  }, [fetchUser]);

  const realRole = user?.role || null;

  return (
    <div 
      className="flex h-screen bg-paper" 
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Sidebar userRole={realRole} lang={lang} />
      
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600"></div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}