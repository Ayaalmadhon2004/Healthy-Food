"use client";

import { useReducer, useEffect, useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";
import { requestNotificationPermission, showNotification } from "@/utils/notification";
import { addMealAction, getMealsAction, deleteMealAction } from "@/app/actions/mealActions";

const ProgressCard = dynamic(() => import("@/components/ProgressCard"), { ssr: false });
const AddMealForm = dynamic(() => import("@/components/AddMealForm"), { ssr: false });
const MealList = dynamic(() => import("@/components/MealList"), { ssr: false });

const initialState = { 
  meals: [], 
  calories: 0, 
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const result = await getMealsAction(user.id);
      if (result.success) {
        dispatch({ 
          type: "HYDRATE_DATA", 
          payload: { 
            meals: result.meals, 
            calories: result.meals.reduce((s, m) => s + (Number(m.calories) || 0), 0) 
          } 
        });
      }
    }
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
    loadData();
    requestNotificationPermission();
  }, [loadData]);

  // 2. التعامل مع الـ URL Params (ميزتك القديمة)
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

  // 3. إضافة وجبة (Optimistic + Server)
  const handleAddMeal = useCallback(async () => {
    if (!state.mealName || state.inputCalories <= 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in");

    const tempId = Date.now();
    const optimisticMeal = { 
      id: tempId, 
      foodName: state.mealName, // ملاحظة: غيرنا الاسم ليتوافق مع Prisma schema (foodName)
      mealType: state.option, 
      calories: Number(state.inputCalories),
      isOptimistic: true 
    };

    // تحديث الواجهة فوراً
    dispatch({ type: "ADD_MEAL_OPTIMISTIC", payload: optimisticMeal });
    showNotification("تمت الإضافة", state.mealName);

    // إرسال للسيرفر
    const result = await addMealAction({
      userId: user.id,
      mealType: optimisticMeal.mealType,
      foodName: optimisticMeal.foodName,
      calories: optimisticMeal.calories
    });

    if (result.success) {
      dispatch({ type: "REPLACE_MEAL_ID", payload: { oldId: tempId, newMeal: result.meal } });
    } else {
      // إذا فشل الحفظ، نتراجع عن الإضافة
      dispatch({ type: "DELETE_MEAL", payload: tempId });
      alert("حدث خطأ أثناء الحفظ في قاعدة البيانات");
    }
  }, [state.mealName, state.inputCalories, state.option, supabase]);

  // 4. حذف وجبة
  const handleDeleteMeal = async (id) => {
    const originalMeals = state.meals;
    const originalCalories = state.calories;

    // حذف من الواجهة فوراً
    dispatch({ type: "DELETE_MEAL", payload: id });

    const result = await deleteMealAction(id);
    if (!result.success) {
      // تراجع إذا فشل الحذف
      dispatch({ type: "ROLLBACK_MEALS", payload: { meals: originalMeals, calories: originalCalories } });
      alert("فشل الحذف من السيرفر");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[var(--color-primary-light)]" />;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {state.loading ? "جاري التحميل..." : "متتبع الوجبات"}
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