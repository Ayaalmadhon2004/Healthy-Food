import { cache } from "react";
import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { getTip, parseId } from "@/lib/data";
import { routeLang, localePath, type LangParams } from "@/lib/i18n-routing";
import { localizedAlternates } from "@/lib/seo";
import { asLocalized } from "@/lib/types";

const loadTip = cache(async (id: string) => {
  const numericId = parseId(id);
  return numericId === null ? null : getTip(numericId);
});

// Not pre-generated (a build must not need the database for this): each page is rendered on its first
// request and then served from the cache, refreshed at most once an hour.
export const revalidate = 3600;

export function generateStaticParams(): { id: string }[] {
  return [];
}

type Props = LangParams & { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [tip, lang] = await Promise.all([loadTip(id), routeLang(params)]);

  if (!tip) {
    return { title: lang === "ar" ? "النصيحة غير موجودة" : "Tip not found", robots: { index: false } };
  }

  const title = asLocalized(tip.header)[lang];
  const description = asLocalized(tip.advice)[lang] || asLocalized(tip.details)[lang];
  const path = `/tips/${tip.id}`;

  return {
    title,
    description,
    alternates: localizedAlternates(lang, path),
    openGraph: { type: "article", title, description, url: localePath(lang, path), locale: lang === "ar" ? "ar_AR" : "en_US" },
  };
}

export default async function TipDetails({ params }: Props) {
  const { id } = await params;
  const [lang, tip] = await Promise.all([routeLang(params), loadTip(id)]);
  const isRtl = lang === "ar";

  if (!tip) notFound();

  const title = asLocalized(tip.header)[lang];
  const moreDetails = asLocalized(tip.moreDetails)[lang];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-20" dir={isRtl ? "rtl" : "ltr"}>
      <Link
        href="/tips"
        className="inline-flex items-center gap-2 min-h-11 text-sm font-medium text-ink-soft hover:text-olive-800"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" className={isRtl ? "rotate-180" : ""} />
        {lang === "ar" ? "العودة إلى النصائح" : "Back to tips"}
      </Link>

      <article className="mt-6">
        <div className="relative aspect-[5/2] overflow-hidden rounded-lg border border-line bg-paper-deep">
          <SafeImage
            src={tip.image}
            kind="tip"
            seed={tip.id}
            hint={tip.iconName}
            alt={title}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <h1 className="mt-8 text-3xl md:text-4xl font-medium text-ink">
          {title}
        </h1>

        <p className="mt-5 text-xl md:text-2xl text-olive-900 leading-snug border-s-2 border-clay-500 ps-5">
          {asLocalized(tip.advice)[lang]}
        </p>

        <p className="mt-6 text-ink-soft text-lg leading-relaxed">
          {asLocalized(tip.details)[lang]}
        </p>

        {moreDetails && (
          <section className="mt-10 pt-8 border-t border-line-strong">
            <h2 className="text-xl font-semibold text-ink mb-3">
              {lang === "ar" ? "للتوسّع" : "In more detail"}
            </h2>
            <p className="text-ink leading-loose whitespace-pre-line text-[1.0625rem]">
              {moreDetails}
            </p>
          </section>
        )}
      </article>
    </div>
  );
}
