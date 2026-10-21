import { prisma } from "@/lib/prisma";
import FilterButtons from "../../components/recipes/FilterButtons";
import { cookies } from "next/headers";
import { toLang, toRecipe } from "@/lib/types";

export const metadata = {
  title: "Browse Recipes",
  description: "Explore healthy recipes crafted for field nutrition and Gaza kitchen support.",
};

export default async function RecipesPage() {
  const cookieStore = await cookies();
  const lang = toLang(cookieStore.get("lang")?.value);
  const isRtl = lang === "ar";

  const recipes = await prisma.foodRecipe.findMany();

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
