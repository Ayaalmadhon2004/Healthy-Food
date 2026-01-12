/*import { I18n } from 'i18n';
import path from 'path';

const i18n = new I18n();

i18n.configure({
    locales:['ar','en'],
    directory:path.join(process.cwd(),'locales'),
    defaultLocale:'ar',
    objectNotation:true,
    updateFiles:false,
    cookie:'lang',
});
export default i18n;
*/

// lib/i18n.js

// 1. هذه الدالة تعمل فقط في الـ Server Components
// Next.js ذكي كفاية ليعرف أن هذا الاستيراد يتم وقت التنفيذ فقط
export async function getDictionaryServer(locale) {
  const dictionaries = {
    en: () => import("@/locales/en.json").then((module) => module.default),
    ar: () => import("@/locales/ar.json").then((module) => module.default),
  };
  
  // التأكد من أن اللغة مدعومة، وإلا نرجع العربي كافتراضي
  const fetcher = dictionaries[locale] || dictionaries.ar;
  return fetcher();
}

// 2. هذه الدالة تعمل فقط في الـ Client Components (use client)
export async function getDictionaryClient() {
  // الوصول للـ document متاح فقط في المتصفح
  if (typeof window === "undefined") return null; 

  const locale = document.cookie
    .split("; ")
    .find((row) => row.startsWith("lang="))
    ?.split("=")[1] || "ar";

  if (locale === "ar") {
    return import("@/locales/ar.json").then((m) => m.default);
  }
  return import("@/locales/en.json").then((m) => m.default);
}