import type { Metadata } from "next";
import FilterButtons from "@/components/recipes/FilterButtons";
import { routeLang, type LangParams } from "@/lib/i18n-routing";
import { localizedMetadata } from "@/lib/seo";
import { getRecipes } from "@/lib/data";
import { toRecipe } from "@/lib/types";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/recipes", {
    ar: {
      title: "الوصفات",
      description: "وصفات بسيطة من مكونات متوفرة، لكل منها وقت التحضير والسعرات والقيمة الغذائية.",
    },
    en: {
      title: "Recipes",
      description: "Simple dishes made from ingredients that are available, each with cooking time, calories and a nutrition breakdown.",
    },
  });
}

export default async function RecipesPage({ params }: LangParams) {
  const [lang, recipes] = await Promise.all([routeLang(params), getRecipes()]);
  const isRtl = lang === "ar";

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20" dir={isRtl ? "rtl" : "ltr"}>
      <header className="mb-10 md:mb-12 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-medium text-ink">
          {isRtl ? "وصفات من مكونات متوفرة" : "Recipes for what's in the kitchen"}
        </h1>
        <p className="mt-4 text-lg text-ink-soft leading-relaxed">
          {isRtl
            ? "أطباق بسيطة، لكل منها وقت التحضير والسعرات والقيمة الغذائية."
            : "Simple dishes, each with its cooking time, calories and a nutrition breakdown."}
        </p>
      </header>

      {/* نمرر اللغة للـ FilterButtons لضمان توافق الفلترة مع النصوص */}
      <FilterButtons initialRecipes={recipes.map(toRecipe)} />
    </div>
  );
}
