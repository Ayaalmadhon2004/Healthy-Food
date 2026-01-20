"use client";

import Link from "next/link";
import {  useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavbarLinks({ className }) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState("ar");

  // قراءة اللغة من الكوكيز عند تحميل المكون
  useEffect(() => {
    const lang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lang="))
      ?.split("=")[1];
    if (lang) setCurrentLocale(lang);
  }, []);

  const switchLanguage = (newLocale) => {
    // 1. تحديث الكوكي يدوياً
    document.cookie = `lang=${newLocale}; path=/; max-age=31536000`; // صالح لمدة سنة
    
    // 2. تحديث الحالة في الواجهة
    setCurrentLocale(newLocale);

    // 3. إعادة تحميل البيانات من السيرفر ليعرف السيرفر أن اللغة تغيرت
    router.refresh();
    
    // ملاحظة: أحياناً في Next.js يفضل استخدام window.location.reload() 
    // لضمان إعادة رندرة الـ Layout بالكامل بالاتجاه الجديد (RTL/LTR)
    window.location.reload();
  };

  return (
    <>
      <Link href="/dashboard" className={className}>Dashboard</Link>
      <Link href="/recipes" className={className}>Recipes</Link>
      <Link href="/tracker" className={className}>Meal Tracker</Link>
      <Link href="/tips" className={className}>Tips</Link>
      <Link href="/doctors" className={className}>Doctors</Link>
      <Link href="/gaza-kitchen" className={className}>Gaza Kitchen</Link>
      
      <div className="flex gap-2 ml-4">
        <button 
          onClick={() => switchLanguage("ar")}
          className={`px-3 py-1 rounded text-sm transition-all ${
            currentLocale === 'ar' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          العربية
        </button>
        <button 
          onClick={() => switchLanguage("en")}
          className={`px-3 py-1 rounded text-sm transition-all ${
            currentLocale === 'en' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          English
        </button>
      </div>
    </>
  );
}