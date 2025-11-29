import Image from "next/image";
import { getRecipes } from "../../../app/lib/recipes";
import BackButton from "../../../components/BackButton";

export default async function RecipePage({ params }) {
  // Unwrap async params
  const resolvedParams = await params;

  // Fetch all recipes
  const recipes = await getRecipes();

  // Find the meal by ID (string-safe)
  const meal = recipes.find((m) => m.id.toString() === resolvedParams.id);

  if (!meal) {
    return (
      <div className="p-10 text-center text-red-600 text-2xl">
        Recipe Not Found ❌
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      {/* Back Button */}
      <BackButton />
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Image
          src={meal.img}
          alt={meal.title}
          width={600}
          height={400}
          className="rounded-xl shadow-lg object-cover w-full"
        />
        <div>
          <p className="text-green-600 uppercase font-semibold text-sm tracking-wide">
            {meal.type}
          </p>
          <h1 className="text-3xl font-bold mt-1">{meal.title}</h1>
          <p className="text-gray-600 mt-2">
            A nutritious and delicious recipe packed with flavor and healthy ingredients.
          </p>

          {/* Meal Info */}
          <div className="flex items-center gap-6 mt-4 text-gray-700 text-sm">
            <span>⏱ {meal.time}</span>
            <span>🔥 {meal.cal}</span>
            <span>👤 Serves 2</span>
          </div>

          {/* Nutrition */}
          <div className="bg-gray-100 p-5 rounded-xl shadow-sm mt-6 grid grid-cols-2 gap-4">
            {Object.entries(meal.nutrition).map(([key, value]) => (
              <div key={key}>
                <p className="text-gray-500 capitalize">{key}</p>
                <p className="font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients + Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-14">
        {/* Ingredients */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {meal.ingredients.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4 list-decimal list-inside">
            {meal.instructions.map((step, i) => (
              <li key={i} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
