import { headers, cookies } from "next/headers"; // أضفنا cookies
import KitchensFilterClient from "./KitchensFilterClient";
import NutritionSectionClient from "@/components/NutritionSection";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { getKitchensAction } from "@/app/actions/kitchenActions";

export default async function Page() {
  // 1. جلب اللغة من الكوكيز أولاً، ثم الهيدرز كخيار احتياطي
  const cookieStore = await cookies();
  const allHeaders = await headers();
  
  // نتحقق من الكوكيز أولاً لأنها الأضمن
  const lang = cookieStore.get("lang")?.value || allHeaders.get("x-custom-lang") || "ar"; 

  const result = await getKitchensAction();
  const kitchens = result.success ? result.kitchens : [];

  const isAr = lang === "ar";

  return (
    // أضفنا dir={isAr ? "rtl" : "ltr"} هنا لضمان انضباط التنسيق من السيرفر
    <div 
      className="bg-gradient-to-b from-emerald-50 from-0% to-white to-25% flex flex-col items-center min-h-screen p-6"
      dir={isAr ? "rtl" : "ltr"} 
    >
      
      <header className="text-center mt-20 mb-16 max-w-4xl">
        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
          {isAr ? "اعثر على وجبات مجانية بالقرب منك" : "Find Free Meals Near You"}
        </span>
        <h1 className="font-black text-4xl md:text-6xl text-gray-900 leading-tight">
          {isAr ? "مطابخ غزة المجتمعية" : "Gaza Community Kitchens"}
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mt-6 mx-auto leading-relaxed">
          {isAr
            ? "دليل تفاعلي للمطابخ المجتمعية النشطة التي تقدم وجبات مجانية لدعم صمود أهالينا في قطاع غزة."
            : "Locate active community kitchens providing free meals across Gaza to support our community."}
        </p>
      </header>

      {/* نمرر الـ lang بوضوح للمكون العميل */}
      <ErrorBoundaryWrapper message={isAr ? "فشل تحميل قائمة المطابخ" : "Failed to load Kitchens list"}>
        <KitchensFilterClient lang={lang} kitchens={kitchens} />
      </ErrorBoundaryWrapper>

      <div className="w-full mt-24">
        <ErrorBoundaryWrapper message={isAr ? "فشل تحميل قسم التغذية" : "Failed to load Nutrition Section"}>
          <NutritionSectionClient lang={lang} />
        </ErrorBoundaryWrapper>
      </div>
    </div>
  );
}