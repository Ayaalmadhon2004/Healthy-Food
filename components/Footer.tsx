"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  // نصوص الترجمة
  const t = {
    description: {
      en: "Your companion for healthy eating and nutrition tracking.",
      ar: "رفيقك لتناول طعام صحي وتتبع نظامك الغذائي بدقة.",
    },
    explore: {
      title: { en: "Explore", ar: "استكشف" },
      recipes: { en: "Recipes", ar: "الوصفات" },
      tracker: { en: "Meal Tracker", ar: "تتبع الوجبات" },
      profile: { en: "Profile", ar: "الملف الشخصي" },
    },
    admin: {
      title: { en: "Admin", ar: "الإدارة" },
      dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
      manageRecipes: { en: "Manage Recipes", ar: "إدارة الوصفات" },
      manageUsers: { en: "Manage Users", ar: "إدارة المستخدمين" },
    },
    contact: {
      title: { en: "Contact", ar: "التواصل" },
      email: { en: "Email Us", ar: "راسلنا" },
      privacy: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
      terms: { en: "Terms of Service", ar: "شروط الخدمة" },
    },
    madeBy: {
      en: "Made with ❤️ for your health",
      ar: "صُنع بـ ❤️ من أجل صحتك",
    },
  };

  return (
    <footer 
      className="w-full border-t border-gray-300 dark:border-gray-800 bg-white dark:bg-[#111] py-10"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Top Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-gray-700 dark:text-gray-300">

          {/* Brand */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">
                NF
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                NutriFlow
              </span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              {t.description[lang]}
            </p>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white border-b border-green-500 w-fit pb-1">
              {t.explore.title[lang]}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/recipes" className="hover:text-green-600 transition-colors">{t.explore.recipes[lang]}</Link></li>
              <li><Link href="/meal-tracker" className="hover:text-green-600 transition-colors">{t.explore.tracker[lang]}</Link></li>
              <li><Link href="/profile" className="hover:text-green-600 transition-colors">{t.explore.profile[lang]}</Link></li>
            </ul>
          </div>

          {/* Admin Section */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white border-b border-green-500 w-fit pb-1">
              {t.admin.title[lang]}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/admin" className="hover:text-green-600 transition-colors">{t.admin.dashboard[lang]}</Link></li>
              <li><Link href="/admin/recipes" className="hover:text-green-600 transition-colors">{t.admin.manageRecipes[lang]}</Link></li>
              <li><Link href="/admin/users" className="hover:text-green-600 transition-colors">{t.admin.manageUsers[lang]}</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white border-b border-green-500 w-fit pb-1">
              {t.contact.title[lang]}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="hover:text-green-600 transition-colors">{t.contact.email[lang]}</Link></li>
              <li><Link href="/privacy" className="hover:text-green-600 transition-colors">{t.contact.privacy[lang]}</Link></li>
              <li><Link href="/terms" className="hover:text-green-600 transition-colors">{t.contact.terms[lang]}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="flex items-center justify-center gap-1 font-medium italic">
            {t.madeBy[lang]}
          </p>
        </div>

      </div>
    </footer>
  );
}