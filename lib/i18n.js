export async function getDictionaryServer(locale) {
  const dictionaries = {
    en: () => import("@/locales/en.json").then((module) => module.default),
    ar: () => import("@/locales/ar.json").then((module) => module.default),
  };
  
  const fetcher = dictionaries[locale] || dictionaries.ar;
  return fetcher();
}

export async function getDictionaryClient() {
  if (typeof window === "undefined") return null; 

  const locale = document.cookie
    .split("; ")
    .find((row) => row.startsWith("lang="))
    ?.split("=")[1] || "ar";

  if (locale === "ar") {
    return import("@/locales/ar.json").then((m) => m.default);
  }
  return import("@/locales/en.json").then((m) => m.default);
}