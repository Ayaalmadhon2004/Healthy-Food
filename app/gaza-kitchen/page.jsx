// app/page.js
import KitchensFilter from "./kitchen";
import NutritionSection from "./NutritionSection";

export const revalidate = 60; 

async function fetchKitchens() {


   
 const url = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/kitchens`
    : "http://localhost:3000/api/kitchens";

  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISR
  });
  if (!res.ok) throw new Error("Failed to fetch kitchens");
  return res.json();
}

export default async function Page() {
  const kitchens = await fetchKitchens();

  return (
    <div className="bg-gradient-to-b
      from-[var(--color-secondary-light)] from-0%
      to-[var(--color-white)] to-25%
      flex flex-col items-center min-h-screen p-6" 
    >
      <div className="text-center mt-20 ">
        <button className="bg-[var(--color-secondary-light)] p-2 rounded-full">
          Find Free Meals Near You
        </button>
        <h1 className="font-bold text-5xl mt-8">Gaza Community Kitchens</h1>
        <p className="text-[var(--color-gray-500)] text-xl w-full md:w-2/3 mt-8 mb-20 mx-auto">
          Locate active community kitchens providing free meals across Gaza.
          Find distribution times, locations, and meal schedules. Everyone is welcome.
        </p>
      </div>

      {/* Client-side Filter Component */}
      <KitchensFilter kitchens={kitchens} />
      <NutritionSection/>
    </div>
  );
}
