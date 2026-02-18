"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Building2, Languages } from "lucide-react";

export default function NavbarLinks({ className, userRole }) {
  const router = useRouter();
  const { lang, changeLanguage } = useLanguage();

  const isOrg = userRole === "ADMIN" || userRole === "ORG";

  const content = {
    ar: {
      dashboard: "لوحة التحكم",
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
      dashboard: "Dashboard",
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

  return (
    <>
      <Link href="/dashboard" className={className}>{t.dashboard}</Link>
      <Link href="/recipes" className={className}>{t.recipes}</Link>
      <Link href="/tracker" className={className}>{t.tracker}</Link>
      <Link href="/tips" className={className}>{t.tips}</Link>
      <Link href="/doctors" className={className}>{t.doctors}</Link>
      <Link href="/gaza-kitchen" className={className}>{t.kitchen}</Link>

      {isOrg && (
        <Link 
          href="/organization" 
          className={`${className} text-[var(--color-primary)] font-bold flex items-center gap-1.5`}
        >
          <Building2 size={16} />
          {t.organization}
        </Link>
      )}

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