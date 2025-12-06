const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // runtimeCaching: [], // عطلنا مؤقتًا
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, 
  outputFileTracingRoot: __dirname,
};

module.exports = withPWA(nextConfig);
