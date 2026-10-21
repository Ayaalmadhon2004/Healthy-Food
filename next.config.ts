import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Note: Turbopack and the service worker plugin sometimes conflict in dev mode.
  // If you see errors, try removing the 'turbopack' key.
  experimental: {
  },
  outputFileTracingRoot: process.cwd(),
};

export default withSerwist(nextConfig);
