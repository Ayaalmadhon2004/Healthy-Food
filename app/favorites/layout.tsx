import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localizedMetadata, NO_INDEX } from "@/lib/seo";

// This page is a client component, so its metadata lives in the route's layout.
export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("/favorites", {
    ar: { title: "وصفاتك المحفوظة", description: "الوصفات التي حفظتها في مكان واحد." },
    en: { title: "Your saved recipes", description: "The recipes you saved, in one place." },
  }, NO_INDEX);
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
