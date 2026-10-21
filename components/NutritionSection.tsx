import { getNutritionGuide } from "@/lib/data";
import type { Lang, Localized } from "@/lib/types";

interface GuideSection {
  color: string;
  title: Localized;
  description: Localized;
  listTitle: Localized;
  items: Localized[];
}

interface GuideStep {
  number: number | string;
  title: Localized;
  text: Localized;
}

interface GuideContent {
  header: { badge: Localized; title: Localized; subtitle: Localized };
  sections: GuideSection[];
  stretching: { title: Localized; subtitle: Localized; steps: GuideStep[] };
}

// Left-rule colour for each section, keyed by the `color` stored with the content.
const ACCENTS: Record<string, string> = {
  green: "border-olive-600",
  orange: "border-clay-500",
  blue: "border-sea-500",
  yellow: "border-ochre-500",
  red: "border-brick-500",
  purple: "border-plum-400",
  default: "border-line-strong",
};

export default async function NutritionSection({ lang }: { lang: Lang }) {
  const guideData = await getNutritionGuide();
  const isRtl = lang === "ar";

  if (!guideData || !guideData.content) return null;
  
  const { header, sections, stretching } = guideData.content as unknown as GuideContent;

  return (
    <section
      className="border-t border-line-strong pt-12 md:pt-16"
      dir={isRtl ? "rtl" : "ltr"}
      aria-labelledby="nutrition-guide-title"
    >
      {/* Header */}
      <div className="max-w-2xl mb-10 md:mb-14">
        <p className="kicker">{header.badge[lang]}</p>
        <h2 id="nutrition-guide-title" className="mt-2 text-3xl md:text-4xl font-medium text-ink">
          {header.title[lang]}
        </h2>
        <p className="text-ink-soft text-lg mt-4 leading-relaxed">
          {header.subtitle[lang]}
        </p>
      </div>

      {/* Sections: two columns reads better than three once there are six of them */}
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {sections.map((sec, index) => (
          <article
            key={index}
            className={`border-s-4 ps-5 ${ACCENTS[sec.color] ?? ACCENTS.default}`}
          >
            <h3 className="text-xl font-semibold text-ink">{sec.title[lang]}</h3>
            <p className="mt-2 text-ink-soft leading-relaxed">
              {sec.description[lang]}
            </p>

            <h4 className="mt-5 text-sm font-semibold text-ink">
              {sec.listTitle[lang]}
            </h4>
            <ul className={`mt-2 space-y-1.5 text-ink-soft list-disc marker:text-ink-mute ${isRtl ? "pr-5" : "pl-5"}`}>
              {sec.items.map((item, i) => (
                <li key={i}>{item[lang]}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Stretching meals */}
      <div className="mt-16 md:mt-20 bg-paper-deep rounded-xl border border-line p-6 md:p-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-medium text-ink">{stretching.title[lang]}</h2>
          <p className="text-ink-soft mt-2 text-lg">{stretching.subtitle[lang]}</p>
        </div>

        <ol className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2 list-none">
          {stretching.steps.map((step) => (
            <li key={step.number} className="flex gap-4 items-start">
              <span
                className="shrink-0 w-9 text-end font-display text-2xl font-medium leading-none text-clay-700 tabular-nums pt-0.5"
                aria-hidden="true"
              >
                {step.number}
              </span>
              <div className="border-b border-line pb-5 flex-1">
                <h3 className="font-semibold text-ink">{step.title[lang]}</h3>
                <p className="text-ink-soft mt-1 leading-relaxed">
                  {step.text[lang]}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
