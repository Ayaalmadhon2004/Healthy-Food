"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Utensils, 
  Calendar, 
  ClipboardList, 
  Stethoscope, 
  ChevronRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Sidebar() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const isRtl = lang === "ar";

  const menuItems = [
    { id: "overview", label: { en: "Overview", ar: "الرئيسية" }, icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { id: "tracker", label: { en: "Daily Tracker", ar: "المتتبع اليومي" }, icon: <Utensils size={20} />, href: "/dashboard/tracker" },
    { id: "calendar", label: { en: "Monthly View", ar: "الرؤية الشهرية" }, icon: <Calendar size={20} />, href: "/dashboard/tracker/monthly" },
    { id: "org", label: { en: "Organization", ar: "التنظيم" }, icon: <ClipboardList size={20} />, href: "/dashboard/organization" },
    { id: "medical", label: { en: "Medical Section", ar: "قسم الأطباء" }, icon: <Stethoscope size={20} />, href: "/dashboard/medical" },
  ];

  return (
    <aside 
      className="w-64 bg-white border-e border-gray-100 flex flex-col h-[calc(100vh-64px)] sticky top-16"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* 1. Header (اختياري لأن اللوجو في النافبار، لكن يمكن وضعه كعنوان للأدوات) */}
      <div className="p-6">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          {lang === 'ar' ? 'القائمة' : 'Menu'}
        </p>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between p-3 rounded-xl font-bold transition-all group ${
                isActive 
                  ? "bg-green-600 text-white shadow-lg shadow-green-100" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-green-600"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.label[lang]}</span>
              </div>
              
              {/* سهم صغير يظهر عند التمرير أو التنشيط */}
              <ChevronRight 
                size={14} 
                className={`transition-transform ${isRtl ? 'rotate-180' : ''} ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
              />
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer (مساحة للمساعدة أو الإعدادات السريعة) */}
      <div className="p-4 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-gray-600">Online Mode</span>
          </div>
        </div>
      </div>
    </aside>
  );
}