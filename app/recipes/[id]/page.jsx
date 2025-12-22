import Image from "next/image";
import { getRecipes } from "@/lib/recipes";
import BackButton from "../../../components/BackButton";
import LogMealButton from "../../../components/LogMealButton";
import AddToCartButton from "../../../components/AddToCartButton";


export default async function RecipePage({ params }) {
  const resolvedParams = await params;
  const recipes = await getRecipes();
  const meal = recipes.find((m) => m.id.toString() === resolvedParams.id);

  if (!meal) {
    return (
      <div className="p-10 text-center text-red-600 text-2xl bg-[var(--bg-main)]">
        Recipe Not Found ❌
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-main)]">
      <div className="max-w-6xl mx-auto p-6 mt-8 ">
      <BackButton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Image
          src={meal.img}
          alt={meal.title}
          width={500}
          height={300}
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

          <div className="flex items-center gap-6 mt-6 text-gray-700 text-sm">
            <span>⏱ {meal.time}</span>
            <span>🔥 {meal.cal}</span>
            <span>👤 Serves 2</span>
          </div>

          <div className="bg-[var(--color-gray-100)] p-5 rounded-xl shadow-sm mt-8 grid grid-cols-2 gap-4">
            <h1 className="text 5xl font-bold">Nutrrition Info ( per serving )</h1><br/>
            {Object.entries(meal.nutrition).map(([key, value]) => (
              <div key={key}>
                <p className="text-gray-500 capitalize">{key}</p>
                <p className="font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mt-6">
            <LogMealButton calory={meal.cal} mealName={meal.title} className="w-full md:w-auto"/>
            <AddToCartButton meal={meal} className="w-full md:w-auto"/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-14 ">
        <div className="bg-[var(--color-white)] shadow-xl p-3 rounded-xl">
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

        <div className="bg-[var(--color-white)] shadow-xl p-3 rounded-xl">
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
    </div>
    
  );
}
