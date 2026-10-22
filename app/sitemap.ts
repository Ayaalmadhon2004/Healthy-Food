import type { MetadataRoute } from "next";
import { getContentIds } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";
import { absoluteLocaleUrl, LOCALES } from "@/lib/i18n-routing";

// Regenerated at most once an hour. Never fails the build: if the database cannot be
// reached the sitemap simply lists the static routes.
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/gaza-kitchen", priority: 0.9 },
  { path: "/recipes", priority: 0.9 },
  { path: "/tips", priority: 0.8 },
  { path: "/doctors", priority: 0.7 },
  { path: "/login", priority: 0.3 },
  { path: "/signup", priority: 0.3 },
];

// One entry per page per language, each listing all its language versions (hreflang), plus x-default.
function entriesFor(origin: string, path: string, priority: number): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((lang) => [lang, absoluteLocaleUrl(origin, lang, path)]),
  );
  languages["x-default"] = absoluteLocaleUrl(origin, "en", path);
  return LOCALES.map((lang) => ({
    url: absoluteLocaleUrl(origin, lang, path),
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().origin;
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap(({ path, priority }) => entriesFor(base, path, priority));

  try {
    const { recipes, tips } = await getContentIds();
    for (const id of recipes) entries.push(...entriesFor(base, `/recipes/${id}`, 0.7));
    for (const id of tips) entries.push(...entriesFor(base, `/tips/${id}`, 0.6));
  } catch (error) {
    console.error("Sitemap: content ids unavailable, listing static routes only.", error);
  }

  return entries;
}
