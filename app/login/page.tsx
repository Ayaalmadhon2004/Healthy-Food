import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { getDictionaryServer, getServerLang } from '@/lib/i18n';
import { localizedMetadata } from "@/lib/seo";
import LoginClient from './LoginClient';

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("/login", {
    ar: { title: "تسجيل الدخول", description: "سجّل دخولك إلى NutriFlow لمتابعة وجباتك وحجوزاتك وبلاغاتك." },
    en: { title: "Sign in", description: "Sign in to NutriFlow to follow your meals, reservations and reports." },
  });
}

export default async function LoginPage() {
  const lang = await getServerLang();
  const fullDict = await getDictionaryServer(lang);
  const t = (fullDict as { auth: ComponentProps<typeof LoginClient>["t"] }).auth;

  return <LoginClient t={t} />;
}