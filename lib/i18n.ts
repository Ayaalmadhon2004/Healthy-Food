import { cookies, headers } from "next/headers";
import type en from "@/locales/en.json";
import type { Lang } from "@/lib/types";
import { LANG_COOKIE, langFromRequest } from "@/lib/i18n-routing";

export async function getDictionaryServer(locale: string) {
  const dictionaries: Record<string, () => Promise<Record<string, unknown>>> = {
    en: () => import("@/locales/en.json").then((module) => module.default),
    ar: () => import("@/locales/ar.json").then((module) => module.default),
  };
  
  const fetcher = dictionaries[locale] || dictionaries.en;
  return fetcher();
}

export type ServerMessages = typeof en.server;

// Language of a request that has no route param: server actions and API routes. Pages and layouts
// must use the [lang] route param instead. The proxy sets x-lang for locale-prefixed paths; API calls
// carry the page's URL in Referer; the lang cookie and English are the fallbacks.
export async function getRequestLang(): Promise<Lang> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  return langFromRequest({
    xLang: headerStore.get("x-lang"),
    referer: headerStore.get("referer"),
    cookie: cookieStore.get(LANG_COOKIE)?.value,
  });
}

// User-facing messages (errors) from the server.* dictionary, in the request's language
// (or in `lang` when the caller already knows it, e.g. a page).
export async function getServerMessages(lang?: Lang): Promise<ServerMessages> {
  const dict = (await getDictionaryServer(lang ?? (await getRequestLang()))) as { server: ServerMessages };
  return dict.server;
}
