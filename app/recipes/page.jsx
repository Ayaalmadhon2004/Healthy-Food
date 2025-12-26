import { getRecipes } from "@/lib/recipes";
import FilterButtons from "../../components/FilterButtons";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="min-h-screen p-4 md:p-10 bg-[var(--color-primary-light)]">
        <div className="container mx-auto">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left">
        Browse Recipes
      </h1>

      <ErrorBoundaryWrapper message="Failed to load Filter Buttons">
        <FilterButtons initialRecipes={recipes} />
      </ErrorBoundaryWrapper>
      </div>
    </div>
  );
}
