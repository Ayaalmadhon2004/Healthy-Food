export default function MealItem({ meal, onDelete }) {
  return (
    <div className="p-6 border rounded-2xl mb-2 bg-white border-gray-100">
      <strong className="text-xl">
        {meal.option} ({meal.calories} Cal)
      </strong>

      <div className="bg-[var(--color-primary-light)] p-5 rounded-xl flex justify-between w-full mt-5">
        <span className="text-[var(--color-primary-dark)] font-bold">
          {meal.mealName}
        </span>

        <button
          onClick={() => onDelete(meal.id)}
          className="text-red-600 font-bold"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  );
}
