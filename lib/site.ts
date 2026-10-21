// Absolute origin of the site, used for canonical URLs, Open Graph, the sitemap and robots.txt.
// Set NEXT_PUBLIC_SITE_URL in production (e.g. https://nutriflow.example). On Vercel the
// production domain is picked up automatically.
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const SITE_NAME = "NutriFlow";
