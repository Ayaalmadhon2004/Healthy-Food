"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LayoutDashboard, HeartPulse, Stethoscope, Languages } from "lucide-react";

interface NavbarLinksProps {
  className?: string;
  userRole?: string | null;
  onClick?: () => void;
  mobile?: boolean;
}

export default function NavbarLinks({ className, userRole, onClick, mobile = false }: NavbarLinksProps) {
  const { lang, changeLanguage } = useLanguage();
  const pathname = usePathname();

  const normalizedRole = userRole?.toUpperCase().trim();
  const isOrg = normalizedRole === "ADMIN" || normalizedRole === "ORG";
  const isDoctor = normalizedRole === "DOCTOR";

  const content = {
    ar: {
      userDashboard: "المفكرة الصحية",
      orgDashboard: "لوحة التحكم",
      doctorDashboard: "بوابة الطبيب",
      recipes: "الوصفات",
      tracker: "متابعة الوجبات",
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
    if (isOrg) return { label: t.orgDashboard, icon: <LayoutDashboard size={16} strokeWidth={1.75} /> };
    if (isDoctor) return { label: t.doctorDashboard, icon: <Stethoscope size={16} strokeWidth={1.75} /> };
    return { label: t.userDashboard, icon: <HeartPulse size={16} strokeWidth={1.75} /> };
  };

  const dashInfo = getDashboardLinkInfo();

  const link = (href: string, label: string, extra = "") => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`${className} ${extra} ${active ? "!text-ink font-semibold underline decoration-clay-500 decoration-2 underline-offset-[10px]" : ""}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <Link
        href="/dashboard"
        onClick={onClick}
        aria-current={pathname === "/dashboard" ? "page" : undefined}
        className={`${className} inline-flex items-center gap-1.5 !text-olive-800 font-semibold`}
      >
        {dashInfo.icon}
        {dashInfo.label}
      </Link>

      {isOrg && link("/dashboard/reports", t.reports)}

      {link("/recipes", t.recipes)}
      {link("/tracker", t.tracker)}
      {link("/tips", t.tips)}
      {link("/doctors", t.doctors)}
      {link("/gaza-kitchen", t.kitchen)}

      <div className={mobile ? "pt-4" : "flex items-center"}>
        <button
          onClick={() => changeLanguage(lang === 'ar' ? 'en' : 'ar')}
          lang={lang === "ar" ? "en" : "ar"}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-line-strong text-sm text-ink-soft hover:text-ink hover:bg-paper-deep transition-colors"
        >
          <Languages size={15} strokeWidth={1.75} aria-hidden="true" />
          <span>{t.langName}</span>
        </button>
      </div>
    </>
  );
}
