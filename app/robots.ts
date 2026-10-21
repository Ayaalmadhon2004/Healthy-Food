import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { LOCALES, localePath } from "@/lib/i18n-routing";

// Signed-in screens have nothing to index. Listed without a locale; each is blocked in every language.
const PRIVATE_PATHS = ["/dashboard", "/doctors/book", "/tracker", "/favorites", "/support", "/report-area"];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().origin;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // JSON endpoints plus the signed-in screens of both languages.
        disallow: ["/api/", ...LOCALES.flatMap((lang) => PRIVATE_PATHS.map((path) => localePath(lang, path)))],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
