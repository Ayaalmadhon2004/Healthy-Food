import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { localizedMetadata, NO_INDEX } from "@/lib/seo";
import { routeLang, type LangParams } from "@/lib/i18n-routing";

// Signed-in area: keep it out of search results.
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(
    await routeLang(params),
    "/dashboard",
    {
      ar: { title: "لوحة المتابعة", description: "لوحة المتابعة الشخصية في NutriFlow." },
      en: { title: "Dashboard", description: "Your personal NutriFlow dashboard." },
    },
    NO_INDEX,
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
