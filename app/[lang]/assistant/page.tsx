import type { Metadata } from "next";
import AssistantChat from "@/components/assistant/AssistantChat";
import type { AssistantDict } from "@/components/assistant/types";
import { getDictionaryServer } from "@/lib/i18n";
import { routeLang, type LangParams } from "@/lib/i18n-routing";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/assistant", {
    ar: {
      title: "مساعد التغذية",
      description: "اسأل عن الطعام والطبخ وتغذية الأطفال والمرضى بإمكانات محدودة، وستأتيك الإجابة من مصادر NutriFlow مع ذكرها.",
    },
    en: {
      title: "Nutrition assistant",
      description: "Ask about food, cooking and feeding children and patients with limited means. Answers come from NutriFlow's own sources, which are shown.",
    },
  });
}

export default async function AssistantPage({ params }: LangParams) {
  const lang = await routeLang(params);
  const { assistant: t } = (await getDictionaryServer(lang)) as { assistant: AssistantDict };

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="mb-8 md:mb-10 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-medium text-ink">{t.title}</h1>
        <p className="mt-4 text-lg text-ink-soft leading-relaxed">{t.subtitle}</p>
      </header>
      <AssistantChat lang={lang} t={t} />
    </div>
  );
}
