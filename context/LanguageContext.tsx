"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toLang, type Lang } from "@/lib/types";

interface LanguageContextValue {
  lang: Lang;
  changeLanguage: (newLang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  changeLanguage: () => {},
});

export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang: string }) {
  const [lang, setLang] = useState<Lang>(toLang(initialLang));
  const router = useRouter();

  const changeLanguage = (newLang: Lang) => {
    setLang(newLang);
    Cookies.set("lang", newLang, { expires: 365 });
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
