"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Building2, Languages, LayoutDashboard, HeartPulse, Stethoscope } from "lucide-react";

export default function NavbarLinks({ className, userRole }) {
  const router = useRouter();
  const { lang, changeLanguage } = useLanguage();

  const isOrg = userRole === "ADMIN" || userRole === "ORG";
  const isDoctor = userRole === "DOCTOR";

  const content = {
    ar: {
      // الأسماء الديناميكية الجديدة
      userDashboard: "المفكرة الصحية",
      orgDashboard: "إدارة المطبخ",
      doctorDashboard: "بوابة الطبيب",
      
      recipes: "الوصفات",
      tracker: "متبع الوجبات",
      tips: "نصائح صحية",
      doctors: "الأطباء",
      kitchen: "مطبخ غزة",
      organization: "إدارة المنظمة",
      langName: "English",
      shortLang: "EN"
    },
    en: {
      // Dynamic Labels
      userDashboard: "Health Tracker",
      orgDashboard: "Kitchen Manager",
      doctorDashboard: "Doctor Portal",

      recipes: "Recipes",
      tracker: "Meal Tracker",
      tips: "Health Tips",
      doctors: "Doctors",
      kitchen: "Gaza Kitchen",
      organization: "Organization",
      langName: "العربية",
      shortLang: "AR"
    }
  };

  const t = content[lang] || content.ar;

  // دالة لتحديد اسم الرابط والأيقونة بناءً على الدور
  const getDashboardLinkInfo = () => {
    if (isOrg) return { label: t.orgDashboard, icon: <Building2 size={16} /> };
    if (isDoctor) return { label: t.doctorDashboard, icon: <Stethoscope size={16} /> };
    return { label: t.userDashboard, icon: <HeartPulse size={16} /> };
  };

  const dashInfo = getDashboardLinkInfo();

  return (
    <>
      {/* الرابط الأول: ديناميكي حسب الوظيفة */}
      <Link 
        href="/dashboard" 
        className={`${className} flex items-center gap-1.5 font-bold text-[var(--color-primary)]`}
      >
        {dashInfo.icon}
        {dashInfo.label}
      </Link>

      <Link href="/recipes" className={className}>{t.recipes}</Link>
      <Link href="/tracker" className={className}>{t.tracker}</Link>
      <Link href="/tips" className={className}>{t.tips}</Link>
      <Link href="/doctors" className={className}>{t.doctors}</Link>
      <Link href="/gaza-kitchen" className={className}>{t.kitchen}</Link>

      {/* حذفنا رابط "إدارة المنظمة" المكرر لأنه أصبح هو الرابط الأساسي بالأعلى للمنظمات */}
      
      <div className="flex items-center ml-4 mr-2 border-l border-gray-200 pl-4 h-6 my-auto">
        <button 
          onClick={() => changeLanguage(lang === 'ar' ? 'en' : 'ar')}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full 
            bg-white border border-gray-200 hover:border-[var(--color-primary)] 
            hover:bg-green-50/50 transition-all duration-300 shadow-sm active:scale-95"
          title={t.langName}
        >
          <Languages 
            size={16} 
            className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" 
          />
          <span className="text-xs font-bold tracking-wider text-gray-600 group-hover:text-gray-900 uppercase">
            {t.shortLang}
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </>
  );
}