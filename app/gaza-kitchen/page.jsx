import KitchensFilterClient from "./KitchensFilterClient"
import NutritionSectionClient from "@/components/NutritionSection"
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper"

export default function Page() {
  return (
    <div className="bg-gradient-to-b
      from-[var(--color-secondary-light)] from-0%
      to-[var(--color-white)] to-25%
      flex flex-col items-center min-h-screen p-6"
    >
      <div className="text-center mt-20">
        <button className="bg-[var(--color-secondary-light)] p-2 rounded-full">
          Find Free Meals Near You
        </button>
        <h1 className="font-bold text-5xl mt-8">Gaza Community Kitchens</h1>
        <p className="text-[var(--color-gray-500)] text-xl w-full md:w-2/3 mt-8 mb-20 mx-auto">
          Locate active community kitchens providing free meals across Gaza.
        </p>
      </div>

      <ErrorBoundaryWrapper message="Failed to load Kitchens Filter">
        <KitchensFilterClient />
      </ErrorBoundaryWrapper>

      <ErrorBoundaryWrapper message="Failed to load Nutrition Section">
        <NutritionSectionClient />
      </ErrorBoundaryWrapper>
    </div>
  )
}
