import withSerwistInit from "@serwist/next";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: Turbopack and the service worker plugin sometimes conflict in dev mode.
  // If you see errors, try removing the 'turbopack' key.
  experimental: {
  },
  outputFileTracingRoot: __dirname,
};

export default withSerwist(nextConfig);