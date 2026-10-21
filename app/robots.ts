import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().origin;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in screens and JSON endpoints have nothing to index.
        disallow: ["/api/", "/dashboard", "/tracker", "/favorites", "/support", "/report-area"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
