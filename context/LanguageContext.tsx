"use client";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { LANG_COOKIE, localePath, switchLocalePath } from "@/lib/i18n-routing";
import { toLang, type Lang } from "@/lib/types";

interface LanguageContextValue {
  lang: Lang;
  // Goes to the same page in `newLang` (query and hash kept) and remembers the choice.
  changeLanguage: (newLang: Lang) => void;
  // "/recipes" -> "/en/recipes": for router.push/replace and other places that need a path.
  path: (href: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  changeLanguage: () => {},
  path: (href) => localePath("en", href),
});

// The language comes from the URL (the [lang] route segment), so there is no state to keep in sync.
export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang: string }) {
  const lang = toLang(initialLang);
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = useCallback(
    (newLang: Lang) => {
      // The cookie only decides where a bare URL ("/") redirects to; the URL decides the page's language.
      Cookies.set(LANG_COOKIE, newLang, { expires: 365, sameSite: "lax" });
      router.push(switchLocalePath(pathname, newLang) + window.location.search + window.location.hash);
    },
    [router, pathname],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, changeLanguage, path: (href) => localePath(lang, href) }),
    [lang, changeLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
