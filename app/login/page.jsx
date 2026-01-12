import { cookies } from 'next/headers';
import { getDictionaryServer } from '@/lib/i18n';
import LoginClient from './LoginClient';

export default async function LoginPage() {
  // 1. جلب اللغة من الكوكيز (السيرفر)
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ar';
  
  // 2. جلب نصوص الترجمة الخاصة بقسم الـ auth فقط
  const fullDict = await getDictionaryServer(lang);
  const t = fullDict.auth; // نأخذ قسم auth من ملف الـ JSON

  return (
    <main>
       {/* نمرر النصوص لـ LoginClient كـ props */}
        <LoginClient t={t} lang={lang} />
    </main>
  );
}