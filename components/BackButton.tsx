"use client";

import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BackButton() {
  const { lang } = useLanguage();
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-olive-800"
    >
      <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" className={lang === "ar" ? "rotate-180" : ""} />
      {lang === "ar" ? "العودة إلى الوصفات" : "Back to recipes"}
    </button>
  );
}
