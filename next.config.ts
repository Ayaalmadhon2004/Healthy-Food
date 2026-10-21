import type { NextConfig } from "next";
import withPWAInit from "next-pwa";
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Note: Turbopack and next-pwa sometimes conflict in dev mode.
  // If you see errors, try removing the 'turbopack' key.
  experimental: {
  },
  outputFileTracingRoot: process.cwd(),
};

export default withPWA(nextConfig);