"use client";

import { useReducer, useEffect, useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";
import { useLanguage } from "@/context/LanguageContext";
import { requestNotificationPermission, showNotification } from "@/utils/notification";

// 1. استيراد كافة الأكشنز اللازمة
import { 
  addMealAction, 
  getMealsAction, 
  deleteMealAction, 
  getMonthlyGridDataAction,
  getMonthlyStatsAction 
} from "@/app/actions/mealActions";

const ProgressCard = dynamic(() => import("@/components/mealTracker/ProgressCard"), { ssr: false });
const AddMealForm = dynamic(() => import("@/components/mealTracker/AddMealForm"), { ssr: false });
const MealList = dynamic(() => import("@/components/mealTracker/MealList"), { ssr: false });
const MonthlyDashboard = dynamic(() => import("@/components/mealTracker/MonthlyDashboard"), { 
  ssr: false,
  loading: () => <p>Loading Dashboard...</p> 
});
const initialState = { 
  meals: [], 
  calories: 0, 
  monthlyStats: { avgCalories: 0, commitmentDays: 0, totalMeals: 0 },
  mealName: "", 
  option: "Lunch", 
  inputCalories: 0,
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
    case "SET_MEAL_NAME": return { ...state, mealName: action.payload };
    case "SET_OPTION": return { ...state, option: action.payload };
    case "SET_INPUT_CALORIES": return { ...state, inputCalories: action.payload };
    
    case "ADD_MEAL_OPTIMISTIC":
      return { 
        ...state, 
        meals: [action.payload, ...state.meals], 
        calories: state.calories + action.payload.calories, 
        mealName: "", 
        inputCalories: 0, 
        option: "Lunch" 
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
  const [monthlyData, setMonthlyData] = useState({});
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  // 3. دالة جلب البيانات الشاملة (اليومي + الشهري)
const loadData = useCallback(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [mealsRes, gridRes, statsRes] = await Promise.all([
      getMealsAction(user.id),
      getMonthlyGridDataAction(user.id, currentYear, currentMonth),
      getMonthlyStatsAction(user.id, currentYear, currentMonth)
    ]);

    // تحديث القائمة اليومية
    if (mealsRes.success) {
      dispatch({ 
        type: "HYDRATE_DATA", 
        payload: { 
          meals: mealsRes.meals, 
          calories: mealsRes.meals.reduce((s, m) => s + (Number(m.calories) || 0), 0) 
        } 
      });
    }

    // تحديث بيانات المربعات (هذا هو الجزء المهم)
    if (gridRes.success) {
      setMonthlyData({ ...gridRes.dailyTotals }); // استخدام Spread Operator لإجبار الـ State على التحديث
    }

    // تحديث الإحصائيات العلوية
    if (statsRes.success) {
      dispatch({ type: "SET_MONTHLY_STATS", payload: statsRes.stats });
    }
  }
}, [supabase]);

  useEffect(() => {
    setMounted(true);
    loadData();
    requestNotificationPermission();
  }, [loadData]);

  useEffect(() => {
    if (!mounted) return;
    const meal = searchParams.get("meal");
    const cal = searchParams.get("cal");
    if (meal && cal) {
      dispatch({ type: "SET_MEAL_NAME", payload: meal });
      dispatch({ type: "SET_INPUT_CALORIES", payload: Number(cal.replace(/\D/g, "")) });
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, mounted]);

  // 4. دالة إضافة وجبة مع تحديث البيانات الشهرية
  const handleAddMeal = useCallback(async () => {
    if (!state.mealName || state.inputCalories <= 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in");

    const tempId = Date.now();
    const optimisticMeal = { 
      id: tempId, 
      foodName: state.mealName, 
      mealType: state.option, 
      calories: Number(state.inputCalories),
      isOptimistic: true 
    };

    dispatch({ type: "ADD_MEAL_OPTIMISTIC", payload: optimisticMeal });
    showNotification(lang === 'ar' ? "تمت الإضافة" : "Added", state.mealName);

    try {
      const result = await addMealAction({
        userId: user.id,
        mealType: optimisticMeal.mealType,
        foodName: optimisticMeal.foodName,
        calories: optimisticMeal.calories
      });

      if (result.success) {
        dispatch({ type: "REPLACE_MEAL_ID", payload: { oldId: tempId, newMeal: result.meal } });
        // تحديث كل الإحصائيات فوراً
        await loadData(); 
      } else {
        dispatch({ type: "DELETE_MEAL", payload: tempId });
        alert(lang === 'ar' ? "حدث خطأ أثناء الحفظ" : "Save Error");
      }
    } catch (error) {
      dispatch({ type: "DELETE_MEAL", payload: tempId });
      console.error(error);
    }
  }, [state.mealName, state.inputCalories, state.option, supabase, loadData, lang]);

  const handleDeleteMeal = async (id) => {
    const originalMeals = state.meals;
    const originalCalories = state.calories;

    dispatch({ type: "DELETE_MEAL", payload: id });

    const result = await deleteMealAction(id);
    if (!result.success) {
      dispatch({ type: "ROLLBACK_MEALS", payload: { meals: originalMeals, calories: originalCalories } });
      alert("Error deleting");
    } else {
      await loadData(); // تحديث الإحصائيات بعد الحذف
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[var(--color-primary-light)]" />;

  return (
    <div className="container mx-auto pb-20">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {state.loading ? (lang === 'ar' ? "جاري التحميل..." : "Loading...") : (lang === 'ar' ? "متتبع الوجبات" : "Meal Tracker")}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProgressCard calories={state.calories} />
        <AddMealForm state={state} dispatch={dispatch} onAdd={handleAddMeal} />
      </div>

      <MealList meals={state.meals} onDelete={handleDeleteMeal} />

    </div>
  );
}

export default function TrackerPage() {
  return (
    <div className="min-h-screen p-4 md:p-10 bg-[var(--color-primary-light)]">
      <Suspense fallback={<div className="text-center mt-10">Loading Tracker...</div>}>
        <TrackerContent />
      </Suspense>
    </div>
  );
}