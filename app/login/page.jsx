// app/login/page.tsx
import i18n from "@/lib/i18n";
import { cookies } from "next/headers";
import Login from "./LoginClient"; // تأكد أن ملف الكلاينت في نفس المجلد

export default async function Page() {
  // جلب اللغة من الكوكيز
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ar';
  
  i18n.setLocale(lang);

  // جلب الترجمة
  const catalog = i18n.getCatalog(lang);
  const t = catalog ? catalog.auth : {};

  return <Login t={t} lang={lang} />;
}