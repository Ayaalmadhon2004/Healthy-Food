"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface LanguageContextValue {
  lang: string;
  changeLanguage: (newLang: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  changeLanguage: () => {},
});

export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang: string }) {
  const [lang, setLang] = useState(initialLang);
  const router = useRouter();

  const changeLanguage = (newLang: string) => {
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
