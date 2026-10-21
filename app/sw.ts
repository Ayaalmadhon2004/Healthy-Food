/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { getLocaleFromPath, isLocaleExempt, LOCALES, localePath } from "@/lib/i18n-routing";
import { CacheFirst, ExpirationPlugin, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const OFFLINE_URL = "/offline.html";
const DAY = 24 * 60 * 60;

// Our rules come first; the first matching rule wins, and the stock Next.js rules
// (defaultCache) stay behind them as the fallback for everything else.
const runtimeCaching: RuntimeCaching[] = [
  {
    // Sessions, favorites and every other API response are personal: never store them,
    // so a shared device cannot show the previous person's data.
    matcher: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
  {
    // Fingerprinted build output (JS, CSS, fonts): the URL changes when the content does.
    matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
    handler: new CacheFirst({
      cacheName: "next-static",
      plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 365 * DAY, maxAgeFrom: "last-used" })],
    }),
  },
  {
    // Resized photos: show the cached copy immediately and refresh it in the background.
    matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
    handler: new StaleWhileRevalidate({
      cacheName: "next-image",
      plugins: [new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 30 * DAY, maxAgeFrom: "last-used" })],
    }),
  },
  {
    // Illustrations and icons from /public (unversioned file names).
    matcher: ({ sameOrigin, url }) =>
      sameOrigin && (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/")),
    handler: new StaleWhileRevalidate({
      cacheName: "site-assets",
      plugins: [new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 30 * DAY, maxAgeFrom: "last-used" })],
    }),
  },
  {
    // Pages live under /en and /ar. A bare address ("/", "/recipes", an installed app's start_url) is
    // redirected by the server, which does not work offline: fall back to the cached page of either
    // language, then to the offline page.
    matcher: ({ request, sameOrigin, url }) =>
      sameOrigin && request.mode === "navigate" && getLocaleFromPath(url.pathname) === null && !isLocaleExempt(url.pathname),
    handler: async ({ request, url }) => {
      try {
        return await fetch(request);
      } catch {
        for (const lang of LOCALES) {
          const cached = await caches.match(localePath(lang, url.pathname));
          if (cached) return cached;
        }
        return (await caches.match(OFFLINE_URL)) ?? Response.error();
      }
    },
  },
  ...defaultCache,
];

const serwist = new Serwist({
  // /offline.html lives in public/, so it is already part of the injected manifest.
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: OFFLINE_URL,
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
