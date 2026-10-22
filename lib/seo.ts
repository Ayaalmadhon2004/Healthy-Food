import type { Metadata } from "next";
import { LOCALES, localePath } from "@/lib/i18n-routing";
import type { Lang } from "@/lib/types";

type Copy = { title: string; description: string };

const OG_LOCALE: Record<Lang, string> = { ar: "ar_AR", en: "en_US" };

// Canonical URL of this language's page plus hreflang links to every language (and x-default, which
// is the English page). `path` is the page's path without a locale, e.g. "/recipes/3".
export function localizedAlternates(lang: Lang, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(lang, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
      "x-default": localePath("en", path),
    },
  };
}

// Metadata for a route whose title/description exist in both languages.
export function localizedMetadata(
  lang: Lang,
  path: string,
  copy: Record<Lang, Copy>,
  extra: Metadata = {},
): Metadata {
  const { title, description } = copy[lang];
  return {
    title,
    description,
    alternates: localizedAlternates(lang, path),
    openGraph: { title, description, url: localePath(lang, path), locale: OG_LOCALE[lang] },
    ...extra,
  };
}

export const NO_INDEX: Metadata = { robots: { index: false, follow: false } };
