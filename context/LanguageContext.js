"use client";
import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLang }) {
  const [lang, setLang] = useState(initialLang);
  const router=useRouter();

  const changeLanguage = (newLang) => {
    setLang(newLang);
    Cookies.set("lang", newLang,{expires:365}); 
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);