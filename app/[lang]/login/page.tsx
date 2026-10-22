import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { getDictionaryServer } from '@/lib/i18n';
import { routeLang, type LangParams } from '@/lib/i18n-routing';
import { localizedMetadata } from "@/lib/seo";
import LoginClient from './LoginClient';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/login", {
    ar: { title: "تسجيل الدخول", description: "سجّل دخولك إلى NutriFlow لمتابعة وجباتك وحجوزاتك وبلاغاتك." },
    en: { title: "Sign in", description: "Sign in to NutriFlow to follow your meals, reservations and reports." },
  });
}

export default async function LoginPage({ params }: LangParams) {
  const lang = await routeLang(params);
  const fullDict = await getDictionaryServer(lang);
  const t = (fullDict as { auth: ComponentProps<typeof LoginClient>["t"] }).auth;

  return <LoginClient t={t} />;
}