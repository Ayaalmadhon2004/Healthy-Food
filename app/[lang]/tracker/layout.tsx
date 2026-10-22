import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localizedMetadata, NO_INDEX } from "@/lib/seo";
import { routeLang, type LangParams } from "@/lib/i18n-routing";

// This page is a client component, so its metadata lives in the route's layout.
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/tracker", {
    ar: { title: "متابعة الوجبات", description: "سجّل وجباتك اليومية وتابع سعراتك مقابل هدفك." },
    en: { title: "Meal tracker", description: "Log what you eat each day and follow your calories against a goal." },
  }, NO_INDEX);
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
