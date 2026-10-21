import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localizedMetadata } from "@/lib/seo";

// This page is a client component, so its metadata lives in the route's layout.
export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("/signup", {
    ar: { title: "إنشاء حساب", description: "أنشئ حساباً لمتابعة وجباتك وحفظ الوصفات وحجز مكان في المطابخ المجتمعية." },
    en: { title: "Create an account", description: "Create an account to track meals, save recipes and reserve a place at a community kitchen." },
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
