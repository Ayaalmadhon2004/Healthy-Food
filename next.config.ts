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

// Public content pages. Their HTML depends on the `lang` cookie and nothing else (the signed-in
// user is loaded in the browser, never rendered on the server). Next.js sends `no-store` for any
// page that reads cookies, and `no-store` is what stops the back/forward cache, so these routes
// say `private, no-cache` instead: never shared, and revalidated on every normal visit. Pages that
// render per-user data keep Next.js's default. (A `Vary: Cookie` cannot be added here: Next.js
// overwrites Vary when it renders an app page, so UserInitializer checks the language on restore.)
const PUBLIC_PAGES = ["/", "/recipes", "/recipes/:id", "/gaza-kitchen", "/tips", "/tips/:id", "/doctors"];

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
      ...PUBLIC_PAGES.map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "private, no-cache" }],
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
