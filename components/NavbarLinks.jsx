"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LayoutDashboard, HeartPulse, Stethoscope, ClipboardList, Languages, Loader2 } from "lucide-react";

export default function NavbarLinks({ className, userRole, loading, onClick }) { // أضيفي loading هنا
  const { lang, changeLanguage } = useLanguage();

  // 1. إذا كان النظام لا يزال يحمل، لا تعرضي الروابط المتغيرة (Dashboard)
  // لمنع الوميض والقفز بين "المفكرة" و "لوحة التحكم"
  if (loading) {
    return (
      <div className="flex items-center px-4">
        <Loader2 size={16} className="animate-spin text-gray-300" />
      </div>
    );
  }

  const normalizedRole = userRole?.toUpperCase().trim();
  const isOrg = normalizedRole === "ADMIN" || normalizedRole === "ORG";
  const isDoctor = normalizedRole === "DOCTOR";

  const content = {
    ar: {
      userDashboard: "المفكرة الصحية",
      orgDashboard: "لوحة التحكم",
      doctorDashboard: "بوابة الطبيب",
      recipes: "الوصفات",
      tracker: "متبع الوجبات",
      tips: "نصائح صحية",
      doctors: "الأطباء",
      kitchen: "مطبخ غزة",
      reports: "بلاغات المناطق",
      langName: "English",
      shortLang: "EN"
    },
    en: {
      userDashboard: "Health Tracker",
      orgDashboard: "Dashboard",
      doctorDashboard: "Doctor Portal",
      recipes: "Recipes",
      tracker: "Meal Tracker",
      tips: "Health Tips",
      doctors: "Doctors",
      kitchen: "Gaza Kitchen",
      reports: "Area Reports", 
      langName: "العربية",
      shortLang: "AR"
    }
  };

  const t = content[lang] || content.ar;

  const getDashboardLinkInfo = () => {
    if (isOrg) return { label: t.orgDashboard, icon: <LayoutDashboard size={16} /> };
    if (isDoctor) return { label: t.doctorDashboard, icon: <Stethoscope size={16} /> };
    return { label: t.userDashboard, icon: <HeartPulse size={16} /> };
  };

  const dashInfo = getDashboardLinkInfo();

  return (
    <>
      {/* رابط الداشبورد أصبح الآن مستقراً لأنه يعتمد على تحميل البيانات */}
      <Link 
        href="/dashboard" 
        onClick={onClick}
        className={`${className} flex items-center gap-1.5 font-bold text-[var(--color-primary)]`}
      >
        {dashInfo.icon}
        {dashInfo.label}
      </Link>

      {isOrg && (
        <Link href="/dashboard/reports" onClick={onClick} className={`${className} flex items-center gap-1`}>
          <ClipboardList size={16} className="text-gray-400" />
          {t.reports}
        </Link>
      )}

      {/* بقية الروابط الثابتة */}
      <Link href="/recipes" onClick={onClick} className={className}>{t.recipes}</Link>
      <Link href="/tracker" onClick={onClick} className={className}>{t.tracker}</Link>
      <Link href="/tips" onClick={onClick} className={className}>{t.tips}</Link>
      <Link href="/doctors" onClick={onClick} className={className}>{t.doctors}</Link>
      <Link href="/gaza-kitchen" onClick={onClick} className={className}>{t.kitchen}</Link>
      
      {/* زر اللغة */}
      <div className="flex items-center ml-4 mr-2 border-l border-gray-100 pl-4 h-6 my-auto">
        <button 
          onClick={() => changeLanguage(lang === 'ar' ? 'en' : 'ar')}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[var(--color-primary)] transition-all shadow-sm"
        >
          <Languages size={16} className="text-gray-400 group-hover:text-[var(--color-primary)]" />
          <span className="text-xs font-bold text-gray-600 uppercase">{t.shortLang}</span>
        </button>
      </div>
    </>
  );
}