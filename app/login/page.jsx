import { cookies } from 'next/headers';
import { getDictionaryServer } from '@/lib/i18n';
import LoginClient from './LoginClient';

export const metadata = {
  title: "Login | NutriFlow",
  description: "Sign in to NutriFlow to manage your meals, reports, and field nutrition tracking.",
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ar';
  
  const fullDict = await getDictionaryServer(lang);
  const t = fullDict.auth;

  return (
    <main>
      <LoginClient t={t} lang={lang} />
    </main>
  );
}