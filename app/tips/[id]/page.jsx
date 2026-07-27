import { cache } from "react";
import Link from "next/link";
import { Droplet, Bed, Leaf, Activity, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const IconMap = {
  Droplet: Droplet,
  Bed: Bed,
  Leaf: Leaf,
  Activity: Activity,
};

// توليد المسارات الثابتة (Next.js Static Generation)
const getTip = cache(async (id) => {
  return prisma.healthTip.findUnique({
    where: { id: parseInt(id) },
  });
});

export async function generateStaticParams() {
  const tips = await prisma.healthTip.findMany();
  return tips.map((tip) => ({
    id: tip.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const id = params?.id;
  const tip = id ? await getTip(id) : null;
  const cookieStore = cookies();
  const lang = cookieStore.get("lang")?.value || "ar";

  if (!tip) {
    return {
      title: lang === "ar" ? "النصيحة غير موجودة | NutriFlow" : "Tip Not Found | NutriFlow",
      description: lang === "ar" ? "النصيحة المطلوبة غير متوفرة." : "The requested tip is unavailable.",
    };
  }

  return {
    title: `${tip.header[lang]} | NutriFlow`,
    description: lang === "ar"
      ? `اقرأ المزيد عن ${tip.header[lang]} والنصيحة الصحية المتكاملة.`
      : `Read more about ${tip.header[lang]} and the complete health advice.`,
  };
}

export default async function TipDetails({ params }) {
  const id = params?.id;

  // 1. جلب اللغة من الكوكيز
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const isRtl = lang === "ar";

  // 2. جلب النصيحة المحددة من قاعدة البيانات مباشرة
  const tip = id ? await getTip(id) : null;

  if (!tip || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg md:text-xl font-bold">
          {lang === "ar" ? "النصيحة غير موجودة" : "Tip not found"}
        </p>
      </div>
    );
  }

  const IconComponent = IconMap[tip.iconName] || HelpCircle;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#eef7f0] to-[#f6f6f6] p-4 md:p-6 lg:p-10"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-6 md:p-12 border border-gray-100">

        {/* Icon Display */}
        <div className="text-green-600 mb-8 flex justify-center">
          <div className="p-5 bg-green-50 rounded-full shadow-inner">
            <IconComponent size={64} strokeWidth={1.5} />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 text-center leading-tight">
          {tip.header[lang]}
        </h1>

        {/* Advice */}
        <p className="text-lg sm:text-xl md:text-2xl mt-6 text-green-700 font-medium leading-relaxed text-center">
          {tip.advice[lang]}
        </p>

        {/* Details */}
        <p className="text-gray-500 mt-6 leading-relaxed text-center text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
          {tip.details[lang]}
        </p>

        {/* More Details Section */}
        <div className="mt-10 md:mt-12 bg-[#fdfcf9] rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {lang === "ar" ? "تفاصيل إضافية" : "More Details"}
          </h2>
          <p className="text-gray-700 leading-loose whitespace-pre-line text-sm sm:text-base md:text-lg">
            {tip.moreDetails[lang]}
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-10 md:mt-14 flex justify-center">
          <Link
            href="/tips"
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-green-600 transition-all duration-300 shadow-lg active:scale-95"
          >
            <span className={isRtl ? "rotate-180" : ""}>←</span>
            {lang === "ar" ? "العودة للنصائح" : "Back to Tips"}
          </Link>
        </div>
      </div>
    </div>
  );
}