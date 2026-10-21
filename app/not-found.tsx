import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { getServerLang } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  return { title: lang === "ar" ? "الصفحة غير موجودة" : "Page not found", robots: { index: false } };
}

export default async function NotFound() {
  const lang = await getServerLang();
  const isAr = lang === "ar";

  const links = [
    { href: "/recipes", label: isAr ? "الوصفات" : "Recipes" },
    { href: "/gaza-kitchen", label: isAr ? "المطابخ المجتمعية" : "Community kitchens" },
    { href: "/tips", label: isAr ? "نصائح صحية" : "Health tips" },
  ];

  return (
    <div className="max-w-xl mx-auto px-5 py-20 md:py-28 text-center" dir={isAr ? "rtl" : "ltr"}>
      <LogoMark size={56} className="mx-auto" />
      <p className="kicker mt-6">404</p>
      <h1 className="mt-2 text-3xl md:text-4xl font-medium text-ink">
        {isAr ? "لم نجد هذه الصفحة" : "We couldn't find that page"}
      </h1>
      <p className="mt-4 text-lg text-ink-soft leading-relaxed">
        {isAr
          ? "ربما تغيّر الرابط أو أُزيلت الصفحة. يمكنك العودة إلى الرئيسية أو تصفّح أحد الأقسام."
          : "The link may have changed, or the page may have been removed. Go back home or try one of these."}
      </p>
      <Link href="/" className="btn btn-primary mt-8 min-h-11">
        {isAr ? "العودة إلى الرئيسية" : "Back to the home page"}
      </Link>
      <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-link inline-flex items-center min-h-11">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
