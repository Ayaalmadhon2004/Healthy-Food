"use client";

export default function AddMealForm({ state, dispatch, onAdd }) {
  return (
    <div className="w-full rounded-xl bg-white my-4 p-6 shadow-lg">
      <h3 className="font-bold text-xl mb-4">Log New Meal</h3>
      <label htmlFor="meal-option">Type of meals</label>
      <select
        className="border p-2 rounded mb-3 block w-full 
        bg-[var(--color-primary-light)] border-[var(--color-gray-200)]"
        value={state.option}
        onChange={(e) =>
          dispatch({ type: "SET_OPTION", payload: e.target.value })
        }
      >
        <option>Lunch</option>
        <option>Breakfast</option>
        <option>Dinner</option>
        <option>Snack</option>
      </select>

      <input
        type="text"
        placeholder="Meal Name"
        value={state.mealName}
        onChange={(e) =>
          dispatch({ type: "SET_MEAL_NAME", payload: e.target.value })
        }
        className="border p-2 rounded mb-3 w-full 
        bg-[var(--color-primary-light)] border-[var(--color-gray-200)]"
      />

      <input
        type="number"
        placeholder="Calories"
        value={state.inputCalories}
        onChange={(e) =>
          dispatch({
            type: "SET_INPUT_CALORIES",
            payload: Number(e.target.value),
          })
        }
        className="border p-2 rounded mb-3 w-full 
        bg-[var(--color-primary-light)] border-[var(--color-gray-200)]"
      />

      <button
        onClick={onAdd}
        className="bg-[var(--color-primary)] text-white px-4 py-2 rounded w-full"
      >
        + Add Meal
      </button>
    </div>
  );
}
