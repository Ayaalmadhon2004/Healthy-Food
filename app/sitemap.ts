import type { MetadataRoute } from "next";
import { getContentIds } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().origin;
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${base}${path === "/" ? "" : path}`,
    priority,
  }));

  try {
    const { recipes, tips } = await getContentIds();
    for (const id of recipes) entries.push({ url: `${base}/recipes/${id}`, priority: 0.7 });
    for (const id of tips) entries.push({ url: `${base}/tips/${id}`, priority: 0.6 });
  } catch (error) {
    console.error("Sitemap: content ids unavailable, listing static routes only.", error);
  }

  return entries;
}
