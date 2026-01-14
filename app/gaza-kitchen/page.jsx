import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import KitchensFilterClient from "./KitchensFilterClient";
import NutritionSectionClient from "@/components/NutritionSection";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

export default async function Page() {
  const allHeaders = await headers(); 
  const lang = allHeaders.get("x-custom-lang") || "en";

  const kitchens = await prisma.kitchen.findMany();

  return (
    <div className="bg-gradient-to-b
      from-[var(--color-secondary-light)] from-0%
      to-[var(--color-white)] to-25%
      flex flex-col items-center min-h-screen p-6"
    >
      <div className="text-center mt-20">
        <button className="bg-[var(--color-secondary-light)] p-2 rounded-full">
          {lang === "ar" ? "اعثر على وجبات مجانية بالقرب منك" : "Find Free Meals Near You"}
        </button>
        <h1 className="font-bold text-5xl mt-8">
          {lang === "ar" ? "مطابخ غزة المجتمعية" : "Gaza Community Kitchens"}
        </h1>
        <p className="text-[var(--color-gray-500)] text-xl w-full md:w-2/3 mt-8 mb-20 mx-auto">
          {lang === "ar"
            ? "حدد المطابخ المجتمعية النشطة التي تقدم وجبات مجانية في جميع أنحاء غزة."
            : "Locate active community kitchens providing free meals across Gaza."}
        </p>
      </div>

      <ErrorBoundaryWrapper message={lang === "ar" ? "فشل تحميل الفلتر" : "Failed to load Kitchens Filter"}>
        <KitchensFilterClient lang={lang} kitchens={kitchens} />
      </ErrorBoundaryWrapper>

      <ErrorBoundaryWrapper message={lang === "ar" ? "فشل تحميل قسم التغذية" : "Failed to load Nutrition Section"}>
        <NutritionSectionClient lang={lang} />
      </ErrorBoundaryWrapper>
    </div>
  );
}
