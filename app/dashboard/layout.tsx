import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { localizedMetadata, NO_INDEX } from "@/lib/seo";

// Signed-in area: keep it out of search results.
export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
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
