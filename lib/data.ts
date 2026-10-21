import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Read-only reference data (recipes, tips, doctors, the nutrition guide) changes
// only when the database is re-seeded, but every page that shows it is rendered
// per request because the language comes from a cookie. Caching the queries keeps
// those renders off the database. Each query also selects only the columns the UI
// reads, so large unused JSON columns are not pulled over the wire.
const HOUR = 60 * 60;

export const getRecipes = unstable_cache(
  () =>
    prisma.foodRecipe.findMany({
      select: { id: true, img: true, type: true, title: true, time: true, cal: true },
      orderBy: { id: "asc" },
    }),
  ["recipes-list"],
  { revalidate: HOUR, tags: ["recipes"] },
);

export function getRecipe(id: number) {
  return unstable_cache(
    () => prisma.foodRecipe.findUnique({ where: { id } }),
    ["recipe", String(id)],
    { revalidate: HOUR, tags: ["recipes"] },
  )();
}

export const getTips = unstable_cache(
  () =>
    prisma.healthTip.findMany({
      select: { id: true, iconName: true, header: true, advice: true, details: true },
      orderBy: { id: "asc" },
    }),
  ["tips-list"],
  { revalidate: HOUR, tags: ["tips"] },
);

export function getTip(id: number) {
  return unstable_cache(
    () => prisma.healthTip.findUnique({ where: { id } }),
    ["tip", String(id)],
    { revalidate: HOUR, tags: ["tips"] },
  )();
}

export const getDoctors = unstable_cache(
  () =>
    prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialty: true,
        about: true,
        location: true,
        availability: true,
        qualifications: true,
        rating: true,
        image: true,
      },
      orderBy: { id: "asc" },
    }),
  ["doctors-list"],
  { revalidate: HOUR, tags: ["doctors"] },
);

export const getNutritionGuide = unstable_cache(
  () => prisma.nutritionGuide.findFirst({ select: { content: true } }),
  ["nutrition-guide"],
  { revalidate: HOUR, tags: ["nutrition"] },
);

// Ids only, for the sitemap.
export const getContentIds = unstable_cache(
  async () => {
    const [recipes, tips] = await Promise.all([
      prisma.foodRecipe.findMany({ select: { id: true }, orderBy: { id: "asc" } }),
      prisma.healthTip.findMany({ select: { id: true }, orderBy: { id: "asc" } }),
    ]);
    return { recipes: recipes.map((r) => r.id), tips: tips.map((t) => t.id) };
  },
  ["content-ids"],
  { revalidate: HOUR, tags: ["recipes", "tips"] },
);

// Parses a route segment like "12" into an id, or null for anything else ("abc", "1.5", "-3").
export function parseId(raw: string): number | null {
  return /^\d{1,9}$/.test(raw) ? Number(raw) : null;
}
