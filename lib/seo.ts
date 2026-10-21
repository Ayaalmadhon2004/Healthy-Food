import type { Metadata } from "next";
import { getServerLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

type Copy = { title: string; description: string };

// Metadata for a route whose title/description exist in both languages.
// The language is a cookie, so there is one URL per page: the canonical is the page's own
// path and no hreflang alternates are emitted (they would all point at the same URL).
export async function localizedMetadata(
  path: string,
  copy: Record<Lang, Copy>,
  extra: Metadata = {},
): Promise<Metadata> {
  const lang = await getServerLang();
  const { title, description } = copy[lang];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, locale: lang === "ar" ? "ar_AR" : "en_US" },
    ...extra,
  };
}

export const NO_INDEX: Metadata = { robots: { index: false, follow: false } };
