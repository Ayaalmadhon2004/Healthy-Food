"use client";
import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLang }) {
  const [lang, setLang] = useState(initialLang);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    Cookies.set("lang", newLang); // تحديث الكوكي ليعرف الـ Middleware التغيير
    window.location.reload(); // إعادة تحميل الصفحة لتحديث البيانات من السيرفر باللغة الجديدة
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);