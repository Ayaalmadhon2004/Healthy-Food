import { getRecipes } from "@/lib/recipes";
import FilterButtons from "../../components/FilterButtons";

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 bg-[var(--color-primary-light)]">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left">
        Browse Recipes
      </h1>

      <FilterButtons initialRecipes={recipes} />
    </div>
  );
}
