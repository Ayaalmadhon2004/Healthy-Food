import Link from "next/link";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { Droplet, Bed, Leaf, Activity, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const IconMap = {
  Droplet,
  Bed,
  Leaf,
  Activity,
};

// تفعيل الكاش لمدة ساعة لتحسين السرعة
export const revalidate = 3600;

export const metadata = {
  title: "Health Tips | NutriFlow",
  description: "Browse practical health and nutrition tips for food security in Gaza.",
};

export default async function TipsPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const isRtl = lang === "ar";

  // جلب النصائح (يفضل استخدام select لجلب ما نحتاجه فقط لتقليل الحجم)
  const tips = await prisma.healthTip.findMany();

  return (
    <div 
      className="bg-[#fdfcf9] min-h-screen p-4 md:p-10" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <main className="container mx-auto">
        {/* العناوين الرئيسية */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            {lang === "ar" ? "نصائح الصحة والتغذية" : "Health & Nutrition Tips"}
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl leading-relaxed">
            {lang === "ar" ? "خطوات بسيطة لحياة أفضل وأكثر صحة." : "Simple steps for a better, healthier lifestyle."}
          </p>
        </header>

        {/* شبكة النصائح */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tips.map((item) => {
            const IconComponent = IconMap[item.iconName] || HelpCircle;

            return (
              <article key={item.id} className="group flex flex-col h-full">
                {/* العنوان الفرعي - تم تغييره لـ h2 من أجل الـ SEO */}
                <h2 className="mb-4 font-black text-gray-800 text-xl group-hover:text-green-700 transition-colors">
                  {item.header[lang]}
                </h2>

                <div className="bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl p-7 border border-gray-100 flex flex-col flex-grow relative overflow-hidden">
                  
                  {/* الديكور العلوي داخل الكارت */}
                  <div className="flex items-center justify-between bg-orange-50/80 p-4 rounded-2xl mb-6">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <IconComponent className="w-7 h-7 text-green-600" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {lang === "ar" ? "نصيحة اليوم" : "Daily Tip"}
                    </span>
                  </div>

                  {/* المحتوى النصي */}
                  <div className="flex-grow space-y-3">
                    <p className="font-extrabold text-gray-900 text-lg leading-snug">
                      {item.advice[lang]}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed pb-6">
                      {item.details[lang]}
                    </p>
                  </div>

                  {/* رابط الإجراء - تم تحسين التباين */}
                  <ErrorBoundaryWrapper message="Link error">
                    <Link
                      className="block w-full text-center px-6 py-4 bg-green-600 text-white text-sm font-black rounded-2xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 active:scale-95"
                      href={`/tips/${item.id}`}
                    >
                      {lang === "ar" ? "اقرأ المزيد" : "Read more!"}
                    </Link>
                  </ErrorBoundaryWrapper>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}