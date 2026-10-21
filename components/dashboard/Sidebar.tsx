"use client";

import Link from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n-routing";
import { LayoutDashboard, Activity, Calendar, Building2, Stethoscope, LifeBuoy, ClipboardList, CalendarCheck, UserCog } from "lucide-react";

export default function Sidebar({ userRole, lang }: { userRole?: string | null; lang: string }) {
  const pathname = stripLocale(usePathname());
  const isAr = lang === "ar";

  const normalizedRole = userRole ? userRole.toUpperCase().trim() : "GUEST";

  const allTranslations = {
    ar: { menu: "القائمة", overview: "نظرة عامة", daily: "المتتبع اليومي", monthly: "العرض الشهري", organization: "إدارة المطبخ", reports: "بلاغات المناطق", appointments: "مواعيدي", doctorAccounts: "حسابات الأطباء", patients: "قائمة المرضى", support: "الدعم" },
    en: { menu: "Menu", overview: "Overview", daily: "Daily Tracker", monthly: "Monthly View", organization: "Organization", reports: "Area Reports", appointments: "My appointments", doctorAccounts: "Doctor accounts", patients: "Patients List", support: "Support" }
  };

  const t = allTranslations[lang as keyof typeof allTranslations] || allTranslations.en;

  const menuItems = [
    { href: "/dashboard", label: t.overview, icon: <LayoutDashboard size={20} />, roles: ["USER", "ORG", "DOCTOR", "ADMIN", "GUEST"] },
    { href: "/dashboard/tracker", label: t.daily, icon: <Activity size={20} />, roles: ["USER"] },
    { href: "/dashboard/tracker/monthly", label: t.monthly, icon: <Calendar size={20} />, roles: ["USER"] },
    { href: "/dashboard/organization", label: t.organization, icon: <Building2 size={20} />, roles: ["ORG", "ADMIN"] },
    { href: "/dashboard/reports", label: t.reports, icon: <ClipboardList size={20} />, roles: ["ORG", "ADMIN"] },
    { href: "/dashboard/doctors", label: t.doctorAccounts, icon: <UserCog size={20} />, roles: ["ADMIN"] },
    { href: "/dashboard/appointments", label: t.appointments, icon: <CalendarCheck size={20} />, roles: ["USER"] },
    { href: "/dashboard/patients", label: t.patients, icon: <Stethoscope size={20} />, roles: ["DOCTOR"] },
    { href: "/support", label: t.support, icon: <LifeBuoy size={20} />, roles: ["USER"] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(normalizedRole));

  return (
    <aside 
      className={`w-60 h-screen bg-paper p-4 flex flex-col gap-1 ${
        isAr ? "border-l text-right" : "border-r text-left"
      }`} 
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mb-2 px-3 py-2 text-sm font-medium text-ink-mute">
        {t.menu}
      </div>
      
      {filteredItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium group ${
              isActive 
                ? "bg-olive-100 text-olive-900" 
                : "text-ink-soft hover:bg-paper-deep hover:text-ink"
            }`}
          >
            <span className={isActive ? "text-olive-800" : "text-ink-mute"}>
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}