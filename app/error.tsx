"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// Shown when a page throws while rendering. The navbar and footer stay on screen.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="max-w-xl mx-auto px-5 py-20 md:py-28 text-center" dir={isAr ? "rtl" : "ltr"}>
      <h1 className="text-3xl md:text-4xl font-medium text-ink">
        {isAr ? "حدث خطأ غير متوقع" : "Something went wrong"}
      </h1>
      <p className="mt-4 text-lg text-ink-soft leading-relaxed">
        {isAr
          ? "لم نستطع عرض هذه الصفحة. جرّب مرة أخرى، وإن تكرر الخطأ فعد إلى الرئيسية."
          : "We couldn't show this page. Try again, and if it keeps happening, head back home."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary min-h-11">
          {isAr ? "حاول مرة أخرى" : "Try again"}
        </button>
        <Link href="/" className="btn btn-quiet min-h-11">
          {isAr ? "الرئيسية" : "Home"}
        </Link>
      </div>
    </div>
  );
}
