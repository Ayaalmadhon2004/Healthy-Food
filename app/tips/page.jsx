import Link from "next/link";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { Droplet, Bed, Leaf, Activity, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const IconMap = {
  Droplet: Droplet,
  Bed: Bed,
  Leaf: Leaf,
  Activity: Activity,
};

export const revalidate = 3600;

export default async function TipsPage() {
  // 1. جلب اللغة من الكوكيز
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const isRtl = lang === "ar";

  // 2. جلب النصائح من قاعدة البيانات
  const tips = await prisma.healthTip.findMany();

  return (
    <div 
      className="bg-[#fdfcf9] min-h-screen p-4 md:p-10" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto">
        {/* العناوين الرئيسية المترجمة */}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
          {lang === "ar" ? "نصائح الصحة والتغذية" : "Health & Nutrition Tips"}
        </h1>
        <p className="pb-8 text-gray-600 text-lg">
          {lang === "ar" ? "خطوات بسيطة لحياة أفضل وأكثر صحة." : "Simple steps for a better, healthier lifestyle."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((item) => {
            const IconComponent = IconMap[item.iconName] || HelpCircle;

            return (
              <div key={item.id} className="group">
                {/* العنوان الفرعي فوق الكارت */}
                <h3 className="mb-3 font-bold text-gray-800 text-lg">
                  {item.header[lang]}
                </h3>

                <div className="bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-6 border border-gray-100 h-full flex flex-col">
                  {/*Header inside card */}
                  <div className="flex items-center justify-between bg-orange-50/60 p-4 rounded-xl mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IconComponent className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="font-bold text-gray-900">
                      {item.header[lang]}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex-grow">
                    <p className="font-bold text-gray-800 mb-2 text-lg">
                      {item.advice[lang]}
                    </p>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                      {item.details[lang]}
                    </p>
                  </div>

                  {/* Action Link */}
                  <ErrorBoundaryWrapper message="Link error">
                    <Link
                      className="inline-block w-full text-center px-6 py-3 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                      href={`/tips/${item.id}`}
                    >
                      {lang === "ar" ? "اقرأ المزيد" : "Read more!"}
                    </Link>
                  </ErrorBoundaryWrapper>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}