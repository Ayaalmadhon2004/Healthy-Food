"use client"
import { useReducer, useEffect, useCallback } from "react";

// ======= Initial State & Reducer =======
const initialState = {
  meals: [],
  calories: 0,
  mealName: "",
  option: "Lunch",
  inputCalories: 0,
};

function reducer(state, action) {
  switch(action.type) {
    case "SET_MEAL_NAME":
      return { ...state, mealName: action.payload };
    case "SET_OPTION":
      return { ...state, option: action.payload };
    case "SET_INPUT_CALORIES":
      return { ...state, inputCalories: action.payload };
    case "ADD_MEAL":
      const newMeal = {
        id: Date.now(),
        mealName: state.mealName,
        option: state.option,
        calories: state.inputCalories
      };
      return {
        ...state,
        meals: [...state.meals, newMeal],
        calories: state.calories + state.inputCalories,
        mealName: "",
        inputCalories: 0
      };
    case "DELETE_MEAL":
      const filteredMeals = state.meals.filter(meal => meal.id !== action.payload);
      const totalCalories = filteredMeals.reduce((sum, meal) => sum + meal.calories, 0);
      return { ...state, meals: filteredMeals, calories: totalCalories };
    case "SET_ALL":
      const total = action.payload.reduce((sum, meal) => sum + meal.calories, 0);
      return { ...state, meals: action.payload, calories: total };
    default:
      return state;
  }
}

// ======= Components =======

// ProgressCard Component
const ProgressCard = ({ calories }) => {
  const percent = Math.min(100, Math.round((calories / 2000) * 100));
  return (
    <div className="w-100 h-80 rounded-xl my-10 p-10 bg-gradient-to-br from-[rgba(227,238,224,1)] to-[rgba(240,238,226,1)]">
      <div className='flex items-center justify-between pb-8'>
        <h3 className='font-bold text-xl'>Today's Goal</h3>
        <span>{percent}%</span>
      </div>

      <div className='flex items-center justify-between pb-8'>
        <span>{calories} / 2000 calories</span>
      </div>

      <div className="w-full h-4 bg-white/40 rounded-full mb-4">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percent < 70 ? "bg-green-600" : percent < 100 ? "bg-yellow-500" : "bg-red-600"
          }`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className='text-[var(--color-gray-300)]'>{Math.max(2000 - calories, 0)} calories remaining</p>
    </div>
  );
};

// AddMealForm Component
const AddMealForm = ({ state, dispatch, onAdd }) => (
  <div className='w-100 h-auto rounded-xl bg-[var(--color-white)] my-10 p-10 shadow-lg'>
    <h3 className='font-bold text-xl mb-4'>Log New Meal</h3>

    <select
      className="border p-2 rounded mb-3 block w-full bg-[var(--color-primary-light)] border-[var(--color-gray-200)] radius-4xl"
      value={state.option}
      onChange={(e) => dispatch({ type: "SET_OPTION", payload: e.target.value })}
    >
      <option>Lunch</option>
      <option>Breakfast</option>
      <option>Dinner</option>
      <option>Snack</option>
    </select>

    <input
      type='text'
      placeholder="Meal Name"
      value={state.mealName}
      onChange={(e) => dispatch({ type: "SET_MEAL_NAME", payload: e.target.value })}
      className='border p-2 rounded block mb-3 w-full bg-[var(--color-primary-light)] border-[var(--color-gray-200)]'
    />

    <input
      type='number'
      placeholder='Calories'
      value={state.inputCalories}
      onChange={(e) => dispatch({ type: "SET_INPUT_CALORIES", payload: Number(e.target.value) })}
      className='border p-2 rounded block mb-3 w-full bg-[var(--color-primary-light)] border-[var(--color-gray-200)]'
    />

    <button
      onClick={onAdd}
      className='bg-[var(--color-primary)] text-white px-4 py-2 rounded w-full'
    >
      + Add Meal
    </button>
  </div>
);

// MealItem Component
const MealItem = ({ meal, onDelete }) => (
  <div className="p-6 border rounded mb-2 bg-[var(--color-white)] border-[var(--color-gray-100)] rounded-2xl ">
    <strong className="text-xl">{meal.option} ({meal.calories + " Cal"})</strong>  
    <div className="bg-[var(--color-primary-light)] p-5 rounded-xl items flex justify-between w-full mt-5">
      <span className="text-[var(--color-primary-dark)] font-bold"> {meal.mealName} </span>
      <button
      onClick={() => onDelete(meal.id)}
      className="text-red-600 font-bold">
      Delete
      </button>
    </div>
  </div>
);

// MealList Component
const MealList = ({ meals, onDelete }) => (
  <div className='mt-10'>
    <h2 className='text-2xl font-bold mb-4'>Meals Added</h2>
    {meals.length === 0 && <p>No meals added yet.</p>}
    {meals.map((meal) => (
      <MealItem key={meal.id} meal={meal} onDelete={onDelete} />
    ))}
  </div>
);

// ======= Main Page Component =======
export default function Page() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load data from LocalStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("meals")) || [];
    dispatch({ type: "SET_ALL", payload: savedData });
  }, []);

  useEffect(() => {
    localStorage.setItem("meals", JSON.stringify(state.meals));
  }, [state.meals]);

  const handleAddMeal = useCallback(() => {
    if (!state.mealName || state.inputCalories <= 0) return;
    dispatch({ type: "ADD_MEAL" });
  }, [state.mealName, state.inputCalories]);

  const handleDeleteMeal = useCallback((id) => {
    dispatch({ type: "DELETE_MEAL", payload: id });
  }, []);

  return (
    <div className='px-80 py-10 bg-[var(--color-primary-light)]'>
      <h1 className='text-4xl font-bold'>Meal Tracker</h1>
      <div className="flex gap-10">
        <ProgressCard calories={state.calories} />
        <AddMealForm state={state} dispatch={dispatch} onAdd={handleAddMeal} />
      </div>
      <MealList meals={state.meals} onDelete={handleDeleteMeal} />
    </div>
  );
}
