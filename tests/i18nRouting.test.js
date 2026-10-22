import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  LOCALES,
  absoluteLocaleUrl,
  decideLocaleRoute,
  getLocaleFromPath,
  isLocaleExempt,
  langFromRequest,
  localePath,
  localizeHref,
  parseAcceptLanguage,
  preferredLocale,
  stripLocale,
  switchLocalePath,
} from "@/lib/i18n-routing";

test("locales: English is the default", () => {
  assert.deepEqual([...LOCALES].sort(), ["ar", "en"]);
  assert.equal(DEFAULT_LOCALE, "en");
});

test("localePath prefixes paths and keeps query and hash", () => {
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(localePath("ar", "/recipes"), "/ar/recipes");
  assert.equal(localePath("ar", "/recipes/3?x=1#top"), "/ar/recipes/3?x=1#top");
  assert.equal(localePath("en", "/?success=true"), "/en?success=true");
  assert.equal(localePath("en", "login"), "/en/login");
});

test("localePath replaces a locale that is already there", () => {
  assert.equal(localePath("ar", "/en/recipes"), "/ar/recipes");
  assert.equal(localePath("en", "/en"), "/en");
  assert.equal(localePath("en", "/en/"), "/en");
});

test("stripLocale removes only a leading locale segment", () => {
  assert.equal(stripLocale("/en/recipes/3"), "/recipes/3");
  assert.equal(stripLocale("/ar"), "/");
  assert.equal(stripLocale("/ar?x=1"), "/?x=1");
  assert.equal(stripLocale("/recipes"), "/recipes");
  assert.equal(stripLocale("/english"), "/english");
  assert.equal(stripLocale("/en-US/x"), "/en-US/x");
  assert.equal(stripLocale("/"), "/");
});

test("getLocaleFromPath", () => {
  assert.equal(getLocaleFromPath("/ar/tips"), "ar");
  assert.equal(getLocaleFromPath("/en"), "en");
  assert.equal(getLocaleFromPath("/tips"), null);
  assert.equal(getLocaleFromPath("/EN/tips"), null);
});

test("localizeHref leaves non-site links alone", () => {
  assert.equal(localizeHref("ar", "/tips"), "/ar/tips");
  assert.equal(localizeHref("ar", "#main-content"), "#main-content");
  assert.equal(localizeHref("ar", "tel:+970"), "tel:+970");
  assert.equal(localizeHref("ar", "https://wa.me/1"), "https://wa.me/1");
  assert.equal(localizeHref("ar", "//cdn.example/x"), "//cdn.example/x");
  assert.equal(localizeHref("ar", "?page=2"), "?page=2");
});

test("switchLocalePath gives the same page in the other language", () => {
  assert.equal(switchLocalePath("/en/recipes/3", "ar"), "/ar/recipes/3");
  assert.equal(switchLocalePath("/ar", "en"), "/en");
  assert.equal(switchLocalePath("/ar/doctors/book?doctor=2", "en"), "/en/doctors/book?doctor=2");
});

test("absoluteLocaleUrl", () => {
  assert.equal(absoluteLocaleUrl("https://x.test", "ar", "/tips/2"), "https://x.test/ar/tips/2");
  assert.equal(absoluteLocaleUrl("https://x.test/", "en", "/"), "https://x.test/en");
});

test("parseAcceptLanguage picks the best supported language", () => {
  assert.equal(parseAcceptLanguage("ar-EG,ar;q=0.9,en;q=0.5"), "ar");
  assert.equal(parseAcceptLanguage("en-US,en;q=0.9,ar;q=0.8"), "en");
  assert.equal(parseAcceptLanguage("fr-FR,fr;q=0.9,ar;q=0.4"), "ar");
  assert.equal(parseAcceptLanguage("en;q=0.3, ar;q=0.8"), "ar");
  assert.equal(parseAcceptLanguage("ar;q=0, en;q=0.1"), "en");
  assert.equal(parseAcceptLanguage("fr,de"), null);
  assert.equal(parseAcceptLanguage(""), null);
  assert.equal(parseAcceptLanguage(null), null);
  assert.equal(parseAcceptLanguage("ar;q=abc"), null);
});

test("preferredLocale: cookie, then browser, then English", () => {
  assert.equal(preferredLocale("ar", "en-US"), "ar");
  assert.equal(preferredLocale("en", "ar"), "en");
  assert.equal(preferredLocale("xx", "ar"), "ar");
  assert.equal(preferredLocale(undefined, "ar-JO"), "ar");
  assert.equal(preferredLocale(undefined, "fr"), "en");
  assert.equal(preferredLocale(undefined, undefined), "en");
});

test("isLocaleExempt: internals, API and files", () => {
  for (const p of ["/_next/static/a.js", "/api/auth/me", "/assets/x.webp", "/icons/a.png", "/sw.js", "/robots.txt", "/sitemap.xml",
    "/manifest.json", "/offline.html", "/opengraph-image.png", "/workbox-4754cb34.js", "/favicon.ico", "/swe-worker-5c72.js"]) {
    assert.equal(isLocaleExempt(p), true, p);
  }
  for (const p of ["/", "/recipes", "/en/recipes/3", "/apiary", "/icons-guide"]) {
    assert.equal(isLocaleExempt(p), false, p);
  }
});

test("decideLocaleRoute: prefixed paths pass through", () => {
  assert.deepEqual(decideLocaleRoute({ pathname: "/en/recipes" }), { action: "next", lang: "en" });
  assert.deepEqual(decideLocaleRoute({ pathname: "/ar" }), { action: "next", lang: "ar" });
  assert.deepEqual(decideLocaleRoute({ pathname: "/api/auth/me" }), { action: "next", lang: null });
  assert.deepEqual(decideLocaleRoute({ pathname: "/sw.js" }), { action: "next", lang: null });
});

test("decideLocaleRoute: bare paths redirect to the preferred language", () => {
  assert.deepEqual(decideLocaleRoute({ pathname: "/" }), { action: "redirect", location: "/en", status: 307 });
  assert.deepEqual(
    decideLocaleRoute({ pathname: "/recipes/3", search: "?a=1", acceptLanguage: "ar,en;q=0.5" }),
    { action: "redirect", location: "/ar/recipes/3?a=1", status: 307 },
  );
  assert.deepEqual(
    decideLocaleRoute({ pathname: "/tips", cookieLang: "en", acceptLanguage: "ar" }),
    { action: "redirect", location: "/en/tips", status: 307 },
  );
  assert.deepEqual(
    decideLocaleRoute({ pathname: "/", cookieLang: "ar" }),
    { action: "redirect", location: "/ar", status: 307 },
  );
});

test("decideLocaleRoute: unknown first segments are treated as bare paths, wrong case is corrected", () => {
  assert.equal(decideLocaleRoute({ pathname: "/fr/recipes" }).location, "/en/fr/recipes");
  assert.equal(decideLocaleRoute({ pathname: "/EN/recipes", search: "?q=1" }).location, "/en/recipes?q=1");
  assert.equal(decideLocaleRoute({ pathname: "/Ar" }).location, "/ar");
});

test("langFromRequest: x-lang, then Referer, then cookie, then English", () => {
  assert.equal(langFromRequest({ xLang: "ar", referer: "https://x.test/en/tips", cookie: "en" }), "ar");
  assert.equal(langFromRequest({ referer: "https://x.test/ar/recipes?x=1", cookie: "en" }), "ar");
  assert.equal(langFromRequest({ referer: "https://x.test/recipes", cookie: "ar" }), "ar");
  assert.equal(langFromRequest({ referer: "not a url", cookie: "ar" }), "ar");
  assert.equal(langFromRequest({ xLang: "fr" }), "en");
  assert.equal(langFromRequest({}), "en");
});
