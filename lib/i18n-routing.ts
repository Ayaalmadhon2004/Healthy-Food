// URL-based locales. Every page lives under /en/... or /ar/...; this file is the single place that
// knows how paths and languages map to each other. It has no framework imports so the proxy,
// server code, client code and the unit tests can all use it.
import { toLang, type Lang } from "@/lib/types";

export const LOCALES = ["en", "ar"] as const satisfies readonly Lang[];
export const DEFAULT_LOCALE: Lang = "en";
export const LANG_COOKIE = "lang";

export function isLocale(value: string | null | undefined): value is Lang {
  return value === "en" || value === "ar";
}

export function otherLocale(lang: Lang): Lang {
  return lang === "ar" ? "en" : "ar";
}

export function dirOf(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

// Splits "/path?query#hash" into its pathname and the rest (query and hash, kept as written).
function splitPath(input: string): { pathname: string; suffix: string } {
  const cut = input.search(/[?#]/);
  return cut === -1 ? { pathname: input, suffix: "" } : { pathname: input.slice(0, cut), suffix: input.slice(cut) };
}

// The locale a pathname starts with, or null when it has none ("/recipes", "/", "/en-US/x").
export function getLocaleFromPath(pathname: string): Lang | null {
  const first = pathname.split("/")[1];
  return isLocale(first) ? first : null;
}

// "/en/recipes/3" -> "/recipes/3", "/ar" -> "/", "/recipes" -> "/recipes". Query and hash are kept.
export function stripLocale(input: string): string {
  const { pathname, suffix } = splitPath(input);
  if (getLocaleFromPath(pathname) === null) return input;
  const rest = pathname.slice(3);
  return (rest === "" ? "/" : rest) + suffix;
}

// "/recipes/3?x=1" + "ar" -> "/ar/recipes/3?x=1". "/" -> "/ar". Any locale already on the path is replaced,
// so it is safe to call on a path that may be prefixed already.
export function localePath(lang: Lang, path: string): string {
  const { pathname, suffix } = splitPath(stripLocale(path));
  const base = pathname === "/" || pathname === "" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${lang}${base}${suffix}`;
}

// For href props: only site-internal absolute paths are prefixed. "#x", "tel:", "https://..." and "//host" stay as they are.
export function localizeHref(lang: Lang, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  return localePath(lang, href);
}

// The same page in another language (query and hash preserved).
export function switchLocalePath(pathname: string, lang: Lang): string {
  return localePath(lang, pathname);
}

// Best supported language from an Accept-Language header ("ar-EG,ar;q=0.9,en;q=0.5"), or null.
export function parseAcceptLanguage(header: string | null | undefined): Lang | null {
  if (!header) return null;
  let best: { lang: Lang; q: number } | null = null;
  for (const part of header.split(",")) {
    const [tag, ...params] = part.trim().split(";");
    const primary = tag.trim().toLowerCase().split("-")[0];
    if (!isLocale(primary)) continue;
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (!Number.isFinite(q) || q <= 0) continue;
    if (!best || q > best.q) best = { lang: primary, q };
  }
  return best?.lang ?? null;
}

// Language for a bare URL: the remembered choice (lang cookie), else the browser's, else English.
export function preferredLocale(cookieLang: string | null | undefined, acceptLanguage: string | null | undefined): Lang {
  if (isLocale(cookieLang)) return cookieLang;
  return parseAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}

// Paths the locale logic must never touch: framework internals, API routes, and anything that is a file.
const EXEMPT_DIRS = ["/_next", "/api", "/assets", "/icons"];
const EXEMPT_STARTS = ["/workbox-", "/swe-worker", "/opengraph-image"];

export function isLocaleExempt(pathname: string): boolean {
  if (EXEMPT_DIRS.some((dir) => pathname === dir || pathname.startsWith(`${dir}/`))) return true;
  if (EXEMPT_STARTS.some((start) => pathname.startsWith(start))) return true;
  const last = pathname.split("/").pop() ?? "";
  return last.includes(".");
}

export type LocaleDecision =
  | { action: "next"; lang: Lang | null }
  | { action: "redirect"; location: string; status: 307 };

// What the proxy does with a request, as a pure function. Prefixed paths pass through; bare paths
// ("/", "/recipes") are redirected to the visitor's preferred locale; "/EN/x" is corrected to "/en/x".
export function decideLocaleRoute(input: {
  pathname: string;
  search?: string;
  cookieLang?: string | null;
  acceptLanguage?: string | null;
}): LocaleDecision {
  const { pathname, search = "" } = input;
  if (isLocaleExempt(pathname)) return { action: "next", lang: null };

  const lang = getLocaleFromPath(pathname);
  if (lang) return { action: "next", lang };

  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first.toLowerCase())) {
    return { action: "redirect", location: `/${first.toLowerCase()}${pathname.slice(first.length + 1)}${search}`, status: 307 };
  }

  const preferred = preferredLocale(input.cookieLang, input.acceptLanguage);
  return { action: "redirect", location: localePath(preferred, pathname) + search, status: 307 };
}

// Language of a request that has no route param (server actions, API routes): the proxy's x-lang header,
// else the locale in the Referer's path (the page that made the call), else the lang cookie, else English.
export function langFromRequest(input: {
  xLang?: string | null;
  referer?: string | null;
  cookie?: string | null;
}): Lang {
  if (isLocale(input.xLang)) return input.xLang;
  if (input.referer) {
    try {
      const fromReferer = getLocaleFromPath(new URL(input.referer).pathname);
      if (fromReferer) return fromReferer;
    } catch {
      // not a URL: ignore
    }
  }
  return toLang(input.cookie);
}

// Absolute URL of a page in a given language, for canonicals, hreflang and the sitemap.
export function absoluteLocaleUrl(origin: string, lang: Lang, path: string): string {
  return `${origin.replace(/\/$/, "")}${localePath(lang, path)}`;
}

// Props every page and layout under app/[lang] receives.
export type LangParams = { params: Promise<{ lang: string }> };

// The validated language of a page's route (the layout has already 404ed unknown values).
export async function routeLang(params: LangParams["params"]): Promise<Lang> {
  return toLang((await params).lang);
}
