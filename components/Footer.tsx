"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "@/components/Logo";

export default function Footer() {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const t = {
    about: {
      en: "Meals, recipes and health advice for families in Gaza, in Arabic and English.",
      ar: "وجبات ووصفات ونصائح صحية للعائلات في غزة، بالعربية والإنجليزية.",
    },
    eat: {
      title: { en: "Eat well", ar: "الأكل الصحي" },
      links: [
        { href: "/gaza-kitchen", en: "Community kitchens", ar: "المطابخ المجتمعية" },
        { href: "/recipes", en: "Recipes", ar: "الوصفات" },
        { href: "/tips", en: "Health tips", ar: "نصائح صحية" },
        { href: "/tracker", en: "Meal tracker", ar: "متابعة الوجبات" },
      ],
    },
    help: {
      title: { en: "Get in touch", ar: "تواصل معنا" },
      links: [
        { href: "/doctors", en: "Our doctors", ar: "الأطباء" },
        { href: "/report-area", en: "Report an underserved area", ar: "بلّغ عن منطقة محرومة" },
        { href: "/support", en: "Support", ar: "الدعم" },
        { href: "/signup", en: "Create an account", ar: "إنشاء حساب" },
      ],
    },
    note: {
      en: "This site shares general nutrition guidance. It does not replace a doctor.",
      ar: "يقدّم هذا الموقع إرشادات تغذية عامة، ولا يغني عن استشارة الطبيب.",
    },
  };

  const columns = [t.eat, t.help];

  return (
    <footer className="w-full mt-20 bg-paper-deep border-t border-line" dir={isRtl ? "rtl" : "ltr"}>
      <div className="band" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-[0.9375rem] text-ink-soft max-w-xs leading-relaxed">{t.about[lang]}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title.en}>
              <h3 className="text-sm font-semibold text-ink mb-3">{col.title[lang]}</h3>
              <ul className="space-y-2 text-[0.9375rem]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-ink-soft hover:text-olive-800 hover:underline underline-offset-4">
                      {l[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 pt-5 border-t border-line text-sm text-ink-mute">{t.note[lang]}</p>
      </div>
    </footer>
  );
}
