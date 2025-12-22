import Image from "next/image";
import ViewButton from "./ViewButton";
import { Clock, Activity } from "lucide-react";
import AddToCartButton from "./AddToCartButton";


export default function RecipeCard({ meal }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-200">
      <Image
        src={meal.img}
        alt={meal.title}
        width={475}
        height={475}
        loading="lazy"
        quality={60}
        className="w-full h-48 sm:h-56 md:h-48 lg:h-56 object-cover"
      />

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-sm sm:text-base text-[var(--color-primary)] font-bold">
          {meal.type}
        </span>

        <h2 className="font-bold text-lg sm:text-xl">{meal.title}</h2>

        <div className="flex justify-between text-gray-600 text-xs sm:text-sm mt-2">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {meal.time}
          </span>
          <span className="flex items-center gap-1">
            <Activity size={14} /> {meal.cal}
          </span>
        </div>

        <ViewButton id={meal.id} />
        <AddToCartButton meal={meal} className="font-normal mt-4 bg-[var(--color-primary)] text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors text-sm sm:text-base"/>

      </div>
    </div>
  );
}
