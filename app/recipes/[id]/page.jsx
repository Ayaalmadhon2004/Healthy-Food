import Image from "next/image";
import BackButton from "../../../components/BackButton";
import LogMealButton from "../../../components/LogMealButton";
import AddToCartButton from "../../../components/AddToCartButton";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function RecipePage({ params }) {
  const { id } = await params;

  // 1. جلب اللغة في السيرفر
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const isRtl = lang === "ar";

  // 2. جلب الوصفة المحددة
  const meal = await prisma.foodRecipe.findUnique({
    where: { id: parseInt(id) }
  });

  if (!meal) {
    return (
      <div className="p-10 text-center text-red-600 text-2xl bg-[var(--bg-main)]">
        {lang === "ar" ? "الوصفة غير موجودة ❌" : "Recipe Not Found ❌"}
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-main)] min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto p-6 mt-1">
        <BackButton />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          <Image
            src={meal.img}
            alt={meal.title[lang]}
            width={500}
            height={400}
            className="rounded-3xl shadow-lg object-cover w-full h-[300px] md:h-[450px]"
          />
          
          <div>
            <p className="text-green-600 uppercase font-bold text-sm tracking-widest">
              {meal.type[lang]}
            </p>
            <h1 className="text-4xl font-black mt-2 text-gray-900">{meal.title[lang]}</h1>
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">
              {lang === "ar" 
                ? "وصفة مغذية ولذيذة مليئة بالنكهات والمكونات الصحية لتقوية جسمك." 
                : "A nutritious and delicious recipe packed with flavor and healthy ingredients to fuel your body."}
            </p>

            <div className="flex items-center gap-6 mt-8 text-gray-700 font-medium">
              <span className="flex items-center gap-2">⏱ {meal.time[lang]}</span>
              <span className="flex items-center gap-2">🔥 {meal.cal[lang]}</span>
              <span className="flex items-center gap-2">👤 {lang === "ar" ? "تكفي لـ 2" : "Serves 2"}</span>
            </div>

            {/* Nutrition Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                {lang === "ar" ? "المعلومات الغذائية (للحصة)" : "Nutrition Info (per serving)"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(meal.nutrition).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-gray-500 text-xs capitalize mb-1">
                      {/* ترجمة أسماء المغذيات يدوياً أو تركها كما هي */}
                      {key === "protein" && (lang === "ar" ? "بروتين" : "Protein")}
                      {key === "carbs" && (lang === "ar" ? "كربوهيدرات" : "Carbs")}
                      {key === "fat" && (lang === "ar" ? "دهون" : "Fat")}
                      {key === "fiber" && (lang === "ar" ? "ألياف" : "Fiber")}
                    </p>
                    <p className="font-black text-gray-900">{value[lang]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              <LogMealButton calory={meal.cal[lang]} mealName={meal.title[lang]} className="w-full" />
              <AddToCartButton meal={meal} className="w-full" />
            </div>
          </div>
        </div>

        {/* Ingredients & Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
          <div className="bg-white shadow-xl p-8 rounded-3xl border border-gray-50">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
               {lang === "ar" ? "المكونات" : "Ingredients"}
            </h2>
            <ul className="space-y-4">
              {meal.ingredients[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 text-lg">
                  <input type="checkbox" className="mt-1.5 h-5 w-5 accent-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white shadow-xl p-8 rounded-3xl border border-gray-50">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
               {lang === "ar" ? "طريقة التحضير" : "Instructions"}
            </h2>
            <ol className="space-y-6">
              {meal.instructions[lang].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed text-lg">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}