import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const THIRTY_DAYS = 60 * 60 * 24 * 30;

// Sent with every response. No script-src CSP on purpose: Next.js streams inline
// scripts for hydration, so a script-src that blocks them needs per-request nonces
// (which would also force every page dynamic). The directives below add protection
// without touching scripts: no plugins, no <base> hijacking, no framing, same-origin forms.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  },
];

// Every page exists under /en and /ar and its HTML depends on the URL alone (the signed-in user is
// loaded in the browser), so public pages are prerendered and keep Next.js's own caching headers
// (`s-maxage=...`, no `no-store`): shared caches may keep them and the back/forward cache is allowed.
// Signed-in screens are the exception: nothing about them may be stored by a shared cache or kept in
// the back/forward cache, so they are marked `private, no-store`.
const LOCALE = ":lang(en|ar)";
const PROTECTED_PAGES = [
  `/${LOCALE}/dashboard/:path*`,
  `/${LOCALE}/tracker`,
  `/${LOCALE}/doctors/book`,
  `/${LOCALE}/report-area`,
  `/${LOCALE}/support`,
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimised images are keyed by URL and width, so they can be cached for a long time.
    minimumCacheTTL: THIRTY_DAYS,
    qualities: [75, 80],
  },
  experimental: {
    // Import only the icons that are used instead of the whole icon set.
    optimizePackageImports: ["lucide-react"],
  },
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...PROTECTED_PAGES.map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      })),
      {
        // Unversioned files: cached for a month, revalidated in the background after that.
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${THIRTY_DAYS}, stale-while-revalidate=604800` }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${THIRTY_DAYS}, stale-while-revalidate=604800` }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        // The service worker must always be re-checked, otherwise updates never reach users.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
