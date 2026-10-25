import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import SafeImage from "@/components/SafeImage";
import { getTips } from "@/lib/data";
import { routeLang, type LangParams } from "@/lib/i18n-routing";
import { localizedMetadata } from "@/lib/seo";
import { asLocalized } from "@/lib/types";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/tips", {
    ar: {
      title: "نصائح صحية",
      description: "نصائح قصيرة وعملية من أطباء وأخصائيي تغذية عن الماء والغذاء والنوم لعائلات غزة.",
    },
    en: {
      title: "Health tips",
      description: "Short, practical advice from doctors and dietitians on water, food and sleep for families in Gaza.",
    },
  });
}

export default async function TipsPage({ params }: LangParams) {
  const [lang, tips] = await Promise.all([routeLang(params), getTips()]);
  const isRtl = lang === "ar";

  return (
    <div
      className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div>
        {/* العناوين الرئيسية */}
        <header className="mb-12 md:mb-14 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-medium text-ink">
            {lang === "ar" ? "نصائح صحية" : "Health tips"}
          </h1>
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">
            {lang === "ar"
              ? "نصائح قصيرة وعملية من أطباء وأخصائيي تغذية، عن الماء والغذاء والنوم."
              : "Short, practical advice from doctors and dietitians on water, food, sleep and staying well."}
          </p>
        </header>

        {/* شبكة النصائح: الأولى أوسع، والباقي بحجم واحد */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {tips.map((item, index) => {
            const title = asLocalized(item.header)[lang];
            const featured = index === 0;

            return (
              <article
                key={item.id}
                className={`surface card-lift overflow-hidden flex flex-col ${featured ? "lg:col-span-3 lg:flex-row" : ""}`}
              >
                <div
                  className={`relative bg-paper-deep border-b border-line ${
                    featured ? "aspect-[5/3] lg:aspect-auto lg:w-[42%] lg:border-b-0 lg:border-e" : "aspect-[5/3]"
                  }`}
                >
                  <SafeImage
                    src={item.image}
                    kind="tip"
                    seed={item.id}
                    hint={item.iconName}
                    alt={title}
                    fill
                    sizes={featured ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"}
                    priority={featured}
                    fetchPriority={featured ? "high" : undefined}
                    className="object-cover"
                  />
                </div>

                <div className={`p-5 flex flex-col flex-1 ${featured ? "lg:p-10 lg:justify-center" : ""}`}>
                  <h2 className={`font-semibold text-ink leading-snug ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
                    {title}
                  </h2>

                  <p className="mt-3 font-medium text-olive-900 leading-snug">
                    {asLocalized(item.advice)[lang]}
                  </p>
                  <p className={`mt-2 text-ink-soft text-[0.9375rem] leading-relaxed ${featured ? "" : "line-clamp-3"}`}>
                    {asLocalized(item.details)[lang]}
                  </p>

                  <Link
                    className="text-link mt-auto pt-5 self-start inline-flex items-center min-h-11"
                    href={`/tips/${item.id}`}
                  >
                    {lang === "ar" ? "اقرأ النصيحة كاملة" : "Read the full tip"}
                    <span className="sr-only"> — {title}</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
