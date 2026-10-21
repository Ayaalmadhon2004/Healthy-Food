"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { localizeHref } from "@/lib/i18n-routing";

// next/link for site-internal paths: "/recipes" becomes "/en/recipes" (or /ar/...) from the current
// language. Anchors, tel:, mailto: and absolute URLs are left alone.
export default function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const { lang } = useLanguage();
  return <Link href={typeof href === "string" ? localizeHref(lang, href) : href} {...props} />;
}
