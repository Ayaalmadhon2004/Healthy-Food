import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localizedMetadata, NO_INDEX } from "@/lib/seo";
import { routeLang, type LangParams } from "@/lib/i18n-routing";

// This page is a client component, so its metadata lives in the route's layout.
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/favorites", {
    ar: { title: "وصفاتك المحفوظة", description: "الوصفات التي حفظتها في مكان واحد." },
    en: { title: "Your saved recipes", description: "The recipes you saved, in one place." },
  }, NO_INDEX);
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
