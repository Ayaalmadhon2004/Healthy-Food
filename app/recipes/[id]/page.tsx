import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Flame, Users } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import BackButton from "../../../components/BackButton";
import LogMealButton from "../../../components/LogMealButton";
import AddToFavButton from "../../../components/recipes/AddToFavButton";
import JsonLd from "@/components/JsonLd";
import { getRecipe, parseId } from "@/lib/data";
import { getServerLang } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";
import { toRecipe, type Localized } from "@/lib/types";

const loadRecipe = cache(async (id: string) => {
  const numericId = parseId(id);
  if (numericId === null) return null;
  const row = await getRecipe(numericId);
  return row ? toRecipe(row) : null;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [meal, lang] = await Promise.all([loadRecipe(id), getServerLang()]);

  if (!meal) {
    return { title: lang === "ar" ? "الوصفة غير موجودة" : "Recipe not found", robots: { index: false } };
  }

  const title = meal.title[lang];
  const description =
    lang === "ar"
      ? `طريقة تحضير ${title}: ${meal.time.ar}، ${meal.cal.ar}، مع المكونات والخطوات والقيمة الغذائية.`
      : `How to make ${title}: ${meal.time.en}, ${meal.cal.en}, with ingredients, steps and nutrition.`;
  const path = `/recipes/${meal.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      url: path,
      locale: lang === "ar" ? "ar_AR" : "en_US",
      images: meal.img ? [{ url: meal.img, alt: title }] : undefined,
    },
  };
}

// "15 min" -> "PT15M" for schema.org. Uses the English text, which always carries the number.
function toIsoDuration(text: string): string | undefined {
  const m = /(\d+)\s*(?:min|m)\b/i.exec(text);
  return m ? `PT${m[1]}M` : undefined;
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [lang, meal] = await Promise.all([getServerLang(), loadRecipe(id)]);
  const isRtl = lang === "ar";

  if (!meal) notFound();

  const siteUrl = getSiteUrl().origin;
  const recipeLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: meal.title[lang],
    inLanguage: lang,
    image: meal.img ? [new URL(meal.img, siteUrl).toString()] : undefined,
    recipeCategory: meal.type[lang],
    totalTime: toIsoDuration(meal.time.en),
    recipeYield: lang === "ar" ? "شخصان" : "2 servings",
    recipeIngredient: meal.ingredients?.[lang] ?? [],
    recipeInstructions: (meal.instructions?.[lang] ?? []).map((text) => ({ "@type": "HowToStep", text })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: meal.cal[lang],
      proteinContent: meal.nutrition?.protein?.[lang],
      carbohydrateContent: meal.nutrition?.carbs?.[lang],
      fatContent: meal.nutrition?.fat?.[lang],
      fiberContent: meal.nutrition?.fiber?.[lang],
    },
  };

  const nutritionLabels: Record<string, Localized> = {
    calories: { en: "Calories", ar: "سعرات" },
    protein: { en: "Protein", ar: "بروتين" },
    carbs: { en: "Carbs", ar: "كربوهيدرات" },
    fat: { en: "Fat", ar: "دهون" },
    fiber: { en: "Fiber", ar: "ألياف" },
    sugar: { en: "Sugar", ar: "سكر" },
    sodium: { en: "Sodium", ar: "صوديوم" },
    iron: { en: "Iron", ar: "حديد" },
  };
  const labelFor = (key: string) =>
    nutritionLabels[key]?.[lang] ?? key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <JsonLd data={recipeLd} />
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-20">
        <BackButton />

        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-8 md:gap-14 mt-6">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg border border-line bg-paper-deep">
            <SafeImage
              src={meal.img}
              kind="dish"
              seed={meal.id}
              alt={meal.title[lang]}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="kicker">{meal.type[lang]}</p>
            <h1 className="text-3xl md:text-4xl font-medium text-ink mt-2">{meal.title[lang]}</h1>

            <p className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-ink-soft">
              <span className="inline-flex items-center gap-2"><Clock size={17} strokeWidth={1.75} className="text-ink-mute" aria-hidden="true" />{meal.time[lang]}</span>
              <span className="inline-flex items-center gap-2"><Flame size={17} strokeWidth={1.75} className="text-ink-mute" aria-hidden="true" />{meal.cal[lang]}</span>
              <span className="inline-flex items-center gap-2"><Users size={17} strokeWidth={1.75} className="text-ink-mute" aria-hidden="true" />{lang === "ar" ? "تكفي شخصين" : "Serves 2"}</span>
            </p>

            {/* Nutrition */}
            {Object.keys(meal.nutrition ?? {}).length > 0 && (
              <section className="mt-8" aria-labelledby="nutrition-heading">
                <h2 id="nutrition-heading" className="text-base font-semibold text-ink pb-2 border-b border-line-strong">
                  {lang === "ar" ? "القيمة الغذائية للحصة الواحدة" : "Nutrition per serving"}
                </h2>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4 mt-4">
                  {Object.entries(meal.nutrition ?? {}).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-ink-mute">{labelFor(key)}</dt>
                      <dd className="text-xl font-semibold text-ink tabular-nums">{value[lang]}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <LogMealButton calory={meal.cal[lang]} mealName={meal.title[lang]} />
              <AddToFavButton meal={meal} />
            </div>
          </div>
        </div>

        {/* Ingredients and method */}
        <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-16 mt-14 md:mt-20 pt-10 border-t border-line-strong">
          <section>
            <h2 className="text-2xl font-medium text-ink mb-5">
              {lang === "ar" ? "المكونات" : "Ingredients"}
            </h2>
            <ul className="divide-y divide-line">
              {(meal.ingredients?.[lang] ?? []).map((item, i) => (
                <li key={i}>
                  <label className="flex items-start gap-3 py-2.5 text-ink cursor-pointer has-[:checked]:text-ink-mute has-[:checked]:line-through">
                    <input type="checkbox" className="mt-1.5 h-4 w-4 accent-olive-700" />
                    <span>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-ink mb-5">
              {lang === "ar" ? "طريقة التحضير" : "Method"}
            </h2>
            <ol className="space-y-6">
              {(meal.instructions?.[lang] ?? []).map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="shrink-0 w-8 text-end font-display text-2xl font-medium leading-none text-clay-700 tabular-nums pt-1" aria-hidden="true">
                    {i + 1}
                  </span>
                  <p className="text-ink leading-relaxed text-[1.0625rem]">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
