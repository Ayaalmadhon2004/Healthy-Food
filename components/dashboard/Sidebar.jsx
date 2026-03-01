"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, Calendar, Building2, Stethoscope } from "lucide-react";

export default function Sidebar({ userRole, lang }) {
  const pathname = usePathname();

  const normalizedRole = userRole ? userRole.toUpperCase().trim() : "GUEST";

  const allTranslations = {
    ar: { menu: "القائمة", overview: "نظرة عامة", daily: "المتتبع اليومي", monthly: "العرض الشهري", organization: "إدارة المطبخ", patients: "قائمة المرضى" },
    en: { menu: "Menu", overview: "Overview", daily: "Daily Tracker", monthly: "Monthly View", organization: "Organization", patients: "Patients List" }
  };

  const t = allTranslations[lang] || allTranslations.en;

  const menuItems = [
    { href: "/dashboard", label: t.overview, icon: <LayoutDashboard size={20} />, roles: ["USER", "ORG", "DOCTOR", "ADMIN", "GUEST"] },
    { href: "/dashboard/tracker", label: t.daily, icon: <Activity size={20} />, roles: ["USER"] },
    { href: "/dashboard/tracker/monthly", label: t.monthly, icon: <Calendar size={20} />, roles: ["USER"] },
    { href: "/dashboard/organization", label: t.organization, icon: <Building2 size={20} />, roles: ["ORG", "ADMIN"] },
    { href: "/dashboard/patients", label: t.patients, icon: <Stethoscope size={20} />, roles: ["DOCTOR"] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(normalizedRole));

  return (
    <aside className="w-64 h-screen bg-white border-r p-4 flex flex-col gap-2">
      <div className="mb-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
        {t.menu}
      </div>
      
      {filteredItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group ${
              isActive 
                ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 hover:text-emerald-500"
            }`}
          >
            <span className={isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}