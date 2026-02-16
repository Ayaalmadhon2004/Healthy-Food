"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Building2 } from "lucide-react";

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
      langBtn: "English"
    },
    en: {
      dashboard: "Dashboard",
      recipes: "Recipes",
      tracker: "Meal Tracker",
      tips: "Health Tips",
      doctors: "Doctors",
      kitchen: "Gaza Kitchen",
      organization: "Organization",
      langBtn: "العربية"
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

      {/* يظهر هذا الرابط فقط للمنظمة والمدير */}
      {isOrg && (
        <Link 
          href="/organization" 
          className={`${className} text-[var(--color-primary)] font-bold flex items-center gap-1`}
        >
          <Building2 size={16} />
          {t.organization}
        </Link>
      )}

      <div className="flex gap-2 mx-4">
        <button 
          onClick={() => changeLanguage(lang === 'ar' ? 'en' : 'ar')}
          className="px-3 py-1 rounded text-sm transition-all bg-gray-100 hover:bg-green-100 border border-gray-300 text-gray-700 flex items-center gap-1"
        >
          {t.langBtn}
        </button>
      </div>
    </>
  );
}