import { cache } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { asLocalized, toLang } from "@/lib/types";

// توليد المسارات الثابتة (Next.js Static Generation)
const getTip = cache(async (id: string) => {
  return prisma.healthTip.findUnique({
    where: { id: parseInt(id) },
  });
});

export async function generateStaticParams() {
  const tips = await prisma.healthTip.findMany();
  return tips.map((tip) => ({
    id: tip.id.toString(),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tip = id ? await getTip(id) : null;
  const cookieStore = await cookies();
  const lang = toLang(cookieStore.get("lang")?.value);

  if (!tip) {
    return {
      title: lang === "ar" ? "النصيحة غير موجودة" : "Tip Not Found",
      description: lang === "ar" ? "النصيحة المطلوبة غير متوفرة." : "The requested tip is unavailable.",
    };
  }

  return {
    title: `${asLocalized(tip.header)[lang]}`,
    description: lang === "ar"
      ? `اقرأ المزيد عن ${asLocalized(tip.header)[lang]} والنصيحة الصحية المتكاملة.`
      : `Read more about ${asLocalized(tip.header)[lang]} and the complete health advice.`,
  };
}

export default async function TipDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. جلب اللغة من الكوكيز
  const cookieStore = await cookies();
  const lang = toLang(cookieStore.get("lang")?.value);
  const isRtl = lang === "ar";

  // 2. جلب النصيحة المحددة من قاعدة البيانات مباشرة
  const tip = id ? await getTip(id) : null;

  if (!tip || !id) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center" dir={isRtl ? "rtl" : "ltr"}>
        <h1 className="text-2xl font-medium text-ink">
          {lang === "ar" ? "لم نجد هذه النصيحة" : "We could not find that tip"}
        </h1>
        <Link href="/tips" className="text-link mt-6 inline-block">
          {lang === "ar" ? "كل النصائح" : "All tips"}
        </Link>
      </div>
    );
  }

  const title = asLocalized(tip.header)[lang];
  const moreDetails = asLocalized(tip.moreDetails)[lang];

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-20" dir={isRtl ? "rtl" : "ltr"}>
      <Link
        href="/tips"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-olive-800"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" className={isRtl ? "rotate-180" : ""} />
        {lang === "ar" ? "العودة إلى النصائح" : "Back to tips"}
      </Link>

      <article className="mt-6">
        <div className="relative aspect-[5/2] overflow-hidden rounded-lg border border-line bg-paper-deep">
          <SafeImage
            kind="tip"
            seed={tip.id}
            hint={tip.iconName}
            alt={title}
            fill
            priority
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
