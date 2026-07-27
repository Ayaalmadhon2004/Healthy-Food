import { prisma } from "@/lib/prisma";
import FilterButtons from "../../components/recipes/FilterButtons";
import { cookies } from "next/headers";

export const metadata = {
  title: "Browse Recipes | NutriFlow",
  description: "Explore healthy recipes crafted for field nutrition and Gaza kitchen support.",
};

export default async function RecipesPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const isRtl = lang === "ar";

  const recipes = await prisma.foodRecipe.findMany();

  const translations = {
    title: { en: "Browse Recipes", ar: "تصفح الوصفات" },
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-10 bg-[var(--color-primary-light)]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-start">
          {translations.title[lang]}
        </h1>
        
        {/* نمرر اللغة للـ FilterButtons لضمان توافق الفلترة مع النصوص */}
        <FilterButtons initialRecipes={recipes} lang={lang} />
      </div>
    </div>
  );
}