"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// A real link (crawlable, opens in a new tab, works without history) rather than history.back().
export default function BackButton() {
  const { lang } = useLanguage();
  return (
    <Link
      href="/recipes"
      className="inline-flex items-center gap-2 min-h-11 text-sm font-medium text-ink-soft hover:text-olive-800"
    >
      <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" className={lang === "ar" ? "rotate-180" : ""} />
      {lang === "ar" ? "العودة إلى الوصفات" : "Back to recipes"}
    </Link>
  );
}
