import { cookies } from "next/headers";
import type en from "@/locales/en.json";
import { toLang, type Lang } from "@/lib/types";

export async function getDictionaryServer(locale: string) {
  const dictionaries: Record<string, () => Promise<Record<string, unknown>>> = {
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

export type ServerMessages = typeof en.server;

// Language of the current request, from the `lang` cookie (Arabic by default).
export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  return toLang(cookieStore.get("lang")?.value);
}

// User-facing messages (errors) from the server.* dictionary, in the request's language.
export async function getServerMessages(): Promise<ServerMessages> {
  const dict = (await getDictionaryServer(await getServerLang())) as { server: ServerMessages };
  return dict.server;
}
