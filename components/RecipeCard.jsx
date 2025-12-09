import Image from "next/image";
import ViewButton from "./ViewButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faFire } from "@fortawesome/free-solid-svg-icons";

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
            <FontAwesomeIcon icon={faClock} /> {meal.time}
          </span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faFire} /> {meal.cal}
          </span>
        </div>

        <ViewButton id={meal.id} />
      </div>
    </div>
  );
}
