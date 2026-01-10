import withPWAInit from "next-pwa";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: Turbopack and next-pwa sometimes conflict in dev mode.
  // If you see errors, try removing the 'turbopack' key.
  experimental: {
  },
  outputFileTracingRoot: __dirname,
};

export default withPWA(nextConfig);