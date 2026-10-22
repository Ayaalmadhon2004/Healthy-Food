import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { ArrowRight } from "lucide-react";
import HomeAnimatedSections from "@/components/HomeAnimatedSections";
import SafeImage from "@/components/SafeImage";
import JsonLd from "@/components/JsonLd";
import { localePath, routeLang, type LangParams } from "@/lib/i18n-routing";
import { localizedAlternates } from "@/lib/seo";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return { alternates: localizedAlternates(await routeLang(params), "/") };
}

export default async function LandingPage({ params }: LangParams) {
  const lang = await routeLang(params);
  const isAr = lang === "ar";
  const siteUrl = getSiteUrl().origin;
  const homeUrl = `${siteUrl}${localePath(lang, "/")}`;

  const t = {
    kicker: isAr ? "غزة" : "Gaza",
    title: isAr ? "طعام صحي لكل بيت في غزة، بما هو متوفر." : "Eating well in Gaza, with what you have.",
    sub: isAr
      ? "اعرف أين تُوزَّع الوجبات اليوم، واطبخ من مكونات موجودة فعلاً، واسأل طبيباً حين يقلقك شيء."
      : "See where meals are served today, cook from ingredients that are actually available, and ask a doctor when something worries you.",
    primary: isAr ? "ابحث عن مطبخ قريب" : "Find a kitchen",
    secondary: isAr ? "تصفّح الوصفات" : "Browse recipes",
    featuredLabel: isAr ? "من الوصفات" : "From the recipes",
    featuredTitle: isAr ? "شوربة العدس" : "Lentil soup",
    featuredText: isAr
      ? "العدس يُخزَّن طويلاً، وسعره قليل، وفيه بروتين وحديد. تكفيك قدر واحدة وبصلة وقليل من الزيت."
      : "Lentils keep for months, cost little, and give you protein and iron. All you need is one pot, an onion and a little oil.",
    featuredLink: isAr ? "كل الوصفات" : "All recipes",
    tipsTitle: isAr ? "نصائح قصيرة من أطباء، بالعربية." : "Short advice from doctors, in plain language.",
    tipsText: isAr
      ? "كم ماءً نشرب؟ ماذا نُطعم الطفل حين يقل الطعام؟ كيف ننام أفضل في الخيمة؟ كتبها أطباء وأخصائيو تغذية، وتقرؤها في دقيقتين."
      : "How much water to drink, what to feed a child when food is short, how to sleep better in a tent. Written by doctors and dietitians, and quick to read.",
    tipsLink: isAr ? "اقرأ النصائح" : "Read the tips",
    doctorsLink: isAr ? "تعرّف على الأطباء" : "Meet the doctors",
    joinTitle: isAr ? "هناك شوارع لم يصلها الطعام بعد." : "Some streets still aren't being reached.",
    joinText: isAr
      ? "إذا كنت متطوعاً أو تدير مطبخاً، سجّل معنا. وإذا رأيت حياً محروماً، بلّغنا ليصل إليه الفريق."
      : "If you volunteer or run a kitchen, sign up with us. If you know a neighbourhood that is going without, tell us so teams can go there.",
    join: isAr ? "إنشاء حساب" : "Create an account",
    report: isAr ? "بلّغ عن منطقة" : "Report an area",
  };

  const arrow = <ArrowRight size={18} strokeWidth={1.75} className={isAr ? "rotate-180" : ""} aria-hidden="true" />;

  return (
    <div className="w-full overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteUrl}/#organization`,
              name: SITE_NAME,
              url: homeUrl,
              logo: `${siteUrl}/icons/icon-512x512.png`,
              description: isAr
                ? "منصة وجبات ووصفات ونصائح صحية للعائلات في غزة."
                : "Meals, recipes and health advice for families in Gaza.",
              areaServed: { "@type": "Place", name: "Gaza" },
            },
            {
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              url: homeUrl,
              name: SITE_NAME,
              inLanguage: ["ar", "en"],
              publisher: { "@id": `${siteUrl}/#organization` },
            },
          ],
        }}
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-20 pb-14 md:pb-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center">
        <div>
          <p className="kicker settle">{t.kicker}</p>
          <h1 className="settle-2 mt-3 text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.12] text-ink max-w-[18ch]">
            {t.title}
          </h1>
          <p className="settle-3 mt-6 text-lg md:text-xl text-ink-soft leading-relaxed max-w-xl">
            {t.sub}
          </p>
          <div className="settle-3 mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/gaza-kitchen" className="btn btn-primary !px-6 !py-3 !text-base">
              {t.primary} {arrow}
            </Link>
            <Link href="/recipes" className="text-link">
              {t.secondary}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <SafeImage
            src="/assets/placeholders/hero-tray.svg"
            alt={isAr ? "صينية طعام مشتركة تتوسطها أطباق صغيرة وغصن زيتون" : "A shared tray of food with small dishes around it and an olive branch"}
            kind="dish"
            width={600}
            height={600}
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="w-full h-auto"
          />
        </div>
      </section>

      <div className="band" aria-hidden="true" />

      {/* Where to start + field reports */}
      <HomeAnimatedSections isAr={isAr} />

      {/* Featured recipe: one dish, given room */}
      <section className="bg-paper-deep border-y border-line">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-paper">
            <SafeImage
              src="/assets/Lentil Soup.jpg"
              alt={isAr ? "وعاء شوربة عدس ساخنة" : "A bowl of hot lentil soup"}
              kind="dish"
              seed="lentil-soup"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="kicker">{t.featuredLabel}</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-medium text-ink">{t.featuredTitle}</h2>
            <p className="mt-4 text-lg text-ink-soft leading-relaxed max-w-lg">{t.featuredText}</p>
            <Link href="/recipes" className="text-link mt-6 inline-flex items-center gap-2">
              {t.featuredLink} {arrow}
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors and tips */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="order-2 lg:order-1 grid grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-4 sm:space-y-5">
            <div className="relative aspect-[5/3] overflow-hidden rounded-lg border border-line">
              <SafeImage src="/assets/placeholders/tip-water.svg" alt="" kind="tip" hint="Droplet" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg border border-line">
              <SafeImage src="/assets/placeholders/tip-rest.svg" alt="" kind="tip" hint="Bed" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
            </div>
          </div>
          <div className="space-y-4 sm:space-y-5 pt-10 sm:pt-14">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-line">
              <SafeImage src="/assets/placeholders/tip-leaf.svg" alt="" kind="tip" hint="Leaf" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
            </div>
            <div className="relative aspect-[5/3] overflow-hidden rounded-lg border border-line">
              <SafeImage src="/assets/placeholders/tip-move.svg" alt="" kind="tip" hint="Activity" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl md:text-4xl font-medium text-ink max-w-[20ch]">{t.tipsTitle}</h2>
          <p className="mt-5 text-lg text-ink-soft leading-relaxed max-w-lg">{t.tipsText}</p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <Link href="/tips" className="text-link">{t.tipsLink}</Link>
            <Link href="/doctors" className="text-link">{t.doctorsLink}</Link>
          </div>
        </div>
      </section>

      {/* Call to join */}
      <section className="px-5 md:px-8 pb-6">
        <div className="max-w-7xl mx-auto bg-olive-800 text-white rounded-xl px-6 md:px-14 py-12 md:py-16 grid md:grid-cols-[1.2fr_1fr] gap-8 items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-medium text-white max-w-[22ch]">{t.joinTitle}</h2>
            <p className="mt-4 text-olive-100 text-lg leading-relaxed max-w-xl">{t.joinText}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/signup" className="btn bg-white text-olive-900 hover:bg-olive-100 !px-6 !py-3">{t.join}</Link>
            <Link href="/report-area" className="btn border-olive-300 text-white hover:bg-olive-700 !px-6 !py-3">{t.report}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
