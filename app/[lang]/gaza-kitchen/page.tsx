import type { Metadata } from "next";
import KitchensFilterClient from "./KitchensFilterClient";
import NutritionSectionClient from "@/components/NutritionSection";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { getKitchensAction } from "@/app/actions/kitchenActions";
import { MessageCircle } from "lucide-react";
import Link from "@/components/LocaleLink";
import { whatsappLink } from "@/lib/contact";
import SafeImage from "@/components/SafeImage";
import { routeLang, type LangParams } from "@/lib/i18n-routing";
import { localizedMetadata } from "@/lib/seo";
import type { KitchenView } from "@/lib/types";

// Reservation counts and "tomorrow" change during the day: the page is rebuilt at most once a minute, and
// straight away after a reservation or a kitchen change (revalidateLocalized in the actions).
export const revalidate = 60;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/gaza-kitchen", {
    ar: {
      title: "المطابخ المجتمعية في غزة",
      description: "وجبات مجانية تُقدَّم كل يوم: موعد التوزيع، وقائمة اليوم، وحجز وجبة الغد في المطابخ المجتمعية.",
    },
    en: {
      title: "Community kitchens in Gaza",
      description: "Free meals served every day: distribution times, today's menu, and reserving tomorrow's meal at community kitchens.",
    },
  });
}

export default async function Page({ params }: LangParams) {
  const lang = await routeLang(params);
  const result = await getKitchensAction(1, 5, lang);
  const isAr = lang === "ar";

  const kitchens = (result.success ? result.kitchens : []) as unknown as KitchenView[];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20" dir={isAr ? "rtl" : "ltr"}>
      <header className="grid md:grid-cols-[1.4fr_0.6fr] gap-8 items-end mb-12 md:mb-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-medium text-ink leading-tight max-w-[20ch]">
            {isAr ? "المطابخ المجتمعية في غزة" : "Community kitchens in Gaza"}
          </h1>
          <p className="text-ink-soft text-lg md:text-xl mt-5 leading-relaxed max-w-2xl">
            {isAr
              ? "وجبات مجانية تُقدَّم كل يوم. اطّلع على موعد التوزيع وقائمة اليوم، واحجز وجبة الغد ليعرف المطبخ كم يطبخ."
              : "Free meals, served every day. Check the time and today's menu, then reserve tomorrow's meal so the kitchen knows how much to cook."}
          </p>
        </div>
        <div className="hidden md:block relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
          <SafeImage
            src="/assets/placeholders/kitchen-pot.svg"
            kind="kitchen"
            alt={isAr ? "قدر كبير يغلي على النار" : "A large pot simmering over a fire"}
            fill
            sizes="25vw"
            className="object-cover"
          />
        </div>
      </header>

      <ErrorBoundaryWrapper message={isAr ? "فشل تحميل قائمة المطابخ" : "Failed to load Kitchens list"}>
        <KitchensFilterClient lang={lang} kitchens={kitchens} />
      </ErrorBoundaryWrapper>

      <section className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="bg-olive-800 text-white p-8 md:p-10 rounded-xl flex flex-col justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-white">
              {isAr ? "ساعد في إبقاء القدور عامرة" : "Help keep the pots full"}
            </h2>
            <p className="mt-3 text-olive-100 text-lg leading-relaxed">
              {isAr
                ? "الدقيق والزيت والعدس هي ما يُبقي الوجبات اليومية للعائلات النازحة. راسلنا على واتساب لننسّق التبرع."
                : "Flour, oil and lentils are what keep daily meals going for displaced families. Message us on WhatsApp and we will arrange the donation."}
            </p>
          </div>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-white text-olive-900 hover:bg-olive-100 self-start !px-5 !py-3"
          >
            <MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>{isAr ? "راسلنا على واتساب" : "Message us on WhatsApp"}</span>
          </a>
        </div>

        <div className="surface p-8 md:p-10 flex flex-col justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-ink">
              {isAr ? "هل تعرف حياً لا يصله شيء؟" : "Know a street that gets nothing?"}
            </h2>
            <p className="mt-3 text-ink-soft text-lg leading-relaxed">
              {isAr
                ? "أخبرنا أين هو. تعتمد فرقنا الميدانية على هذه البلاغات لتقرر وجهتها التالية."
                : "Tell us where it is. Our field teams use these reports to decide where to go next."}
            </p>
          </div>
          <Link href="/report-area" className="btn btn-clay self-start !px-5 !py-3">
            {isAr ? "بلّغ عن منطقة" : "Report an area"}
          </Link>
        </div>
      </section>

      <div className="mt-20 md:mt-28">
        <ErrorBoundaryWrapper message={isAr ? "فشل تحميل قسم التغذية" : "Failed to load Nutrition Section"}>
          <NutritionSectionClient lang={lang} />
        </ErrorBoundaryWrapper>
      </div>
    </div>
  );
}
