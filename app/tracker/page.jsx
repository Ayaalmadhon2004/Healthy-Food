"use client";

import { useReducer, useEffect, useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
import { requestNotificationPermission, showNotification } from "@/utils/notification";
import { supabase } from "@/lib/supabase/client"; 

import { 
  addMealAction, 
  getMealsAction, 
  deleteMealAction, 
  getMonthlyGridDataAction,
  getMonthlyStatsAction 
} from "@/app/actions/mealActions";

const ProgressCard = dynamic(() => import("@/components/mealTracker/ProgressCard"), { 
  ssr: false,
  loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded-2xl" /> 
});
const AddMealForm = dynamic(() => import("@/components/mealTracker/AddMealForm"), { 
  ssr: false 
});
const MealList = dynamic(() => import("@/components/mealTracker/MealList"), { 
  ssr: false 
});

const initialState = { 
  meals: [], 
  calories: 0, 
  monthlyStats: { avgCalories: 0, commitmentDays: 0, totalMeals: 0 },
  loading: true 
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE_DATA":
      return { 
        ...state, 
        meals: action.payload.meals, 
        calories: action.payload.calories,
        loading: false 
      };
    case "SET_MONTHLY_STATS": 
      return { ...state, monthlyStats: action.payload };
    
    case "ADD_MEAL_OPTIMISTIC":
      return { 
        ...state, 
        meals: [action.payload, ...state.meals], 
        calories: state.calories + action.payload.calories, 
      };

    case "REPLACE_MEAL_ID":
      return {
        ...state,
        meals: state.meals.map(m => m.id === action.payload.oldId ? action.payload.newMeal : m)
      };

    case "DELETE_MEAL":
      const updatedMeals = state.meals.filter(m => m.id !== action.payload);
      return { 
        ...state, 
        meals: updatedMeals, 
        calories: updatedMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0) 
      };

    case "ROLLBACK_MEALS":
      return { ...state, meals: action.payload.meals, calories: action.payload.calories };

    default: return state;
  }
}

function TrackerContent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // جلب البيانات - تمت إزالة supabase من المصفوفة لأنها Import ثابت
  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const [mealsRes, statsRes] = await Promise.all([
        getMealsAction(user.id),
        getMonthlyStatsAction(user.id, currentYear, currentMonth)
      ]);

      if (mealsRes.success) {
        dispatch({ 
          type: "HYDRATE_DATA", 
          payload: { 
            meals: mealsRes.meals, 
            calories: mealsRes.meals.reduce((s, m) => s + (Number(m.calories) || 0), 0) 
          } 
        });
      }

      if (statsRes.success) {
        dispatch({ type: "SET_MONTHLY_STATS", payload: statsRes.stats });
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
    // يفضل استدعاء هذا عند الضغط على زر وليس فوراً لتحسين الـ Best Practices
    requestNotificationPermission();
  }, [loadData]);

  // دالة الإضافة - تم تعديلها لتستقبل البيانات من الفورم مباشرة
  const handleAddMeal = useCallback(async (mealData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in");

    const tempId = Date.now();
    const optimisticMeal = { 
      id: tempId, 
      foodName: mealData.name, 
      mealType: mealData.option, 
      calories: Number(mealData.calories),
      isOptimistic: true 
    };

    dispatch({ type: "ADD_MEAL_OPTIMISTIC", payload: optimisticMeal });
    showNotification(lang === 'ar' ? "تمت الإضافة" : "Added", mealData.name);

    try {
      const result = await addMealAction({
        userId: user.id,
        mealType: optimisticMeal.mealType,
        foodName: optimisticMeal.foodName,
        calories: optimisticMeal.calories
      });

      if (result.success) {
        dispatch({ type: "REPLACE_MEAL_ID", payload: { oldId: tempId, newMeal: result.meal } });
        await loadData(); 
      } else {
        dispatch({ type: "DELETE_MEAL", payload: tempId });
      }
    } catch (error) {
      dispatch({ type: "DELETE_MEAL", payload: tempId });
      console.error(error);
    }
  }, [loadData, lang]);

  const handleDeleteMeal = async (id) => {
    const originalMeals = state.meals;
    const originalCalories = state.calories;

    dispatch({ type: "DELETE_MEAL", payload: id });

    const result = await deleteMealAction(id);
    if (!result.success) {
      dispatch({ type: "ROLLBACK_MEALS", payload: { meals: originalMeals, calories: originalCalories } });
    } else {
      await loadData(); 
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[var(--color-primary-light)]" />;

  return (
    <div className="container mx-auto pb-20 px-4">
      <h1 className="text-3xl font-bold my-8 text-center text-gray-800">
        {state.loading ? (lang === 'ar' ? "جاري التحميل..." : "Loading...") : (lang === 'ar' ? "متتبع الوجبات" : "Meal Tracker")}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <ProgressCard calories={state.calories} />
        {/* نمرر دالة الإضافة فقط، الفورم سيهتم بحالته الخاصة */}
        <AddMealForm onAdd={handleAddMeal} />
      </div>

      <div className="mt-12">
         <MealList meals={state.meals} onDelete={handleDeleteMeal} />
      </div>
    </div>
  );
}

export default function TrackerPage() {
  return (
    <div className="min-h-screen bg-[var(--color-primary-light)]">
      <Suspense fallback={<div className="flex justify-center items-center h-screen font-bold">Initializing...</div>}>
        <TrackerContent />
      </Suspense>
    </div>
  );
}