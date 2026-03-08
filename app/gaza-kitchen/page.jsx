import { headers, cookies } from "next/headers";
import KitchensFilterClient from "./KitchensFilterClient";
import NutritionSectionClient from "@/components/NutritionSection";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { getKitchensAction } from "@/app/actions/kitchenActions";
import { MessageCircle, AlertTriangle, Heart } from "lucide-react";

export default async function Page() {
  const cookieStore = await cookies();
  const allHeaders = await headers();
  
  const lang = cookieStore.get("lang")?.value || allHeaders.get("x-custom-lang") || "ar"; 
  const isAr = lang === "ar";

  const result = await getKitchensAction();
  const kitchens = result.success ? result.kitchens : [];

  return (
    <div 
      className="bg-gradient-to-b from-emerald-50 from-0% to-white to-25% flex flex-col items-center min-h-screen p-6 pb-20"
      dir={isAr ? "rtl" : "ltr"} 
    >
      <header className="text-center mt-20 mb-16 max-w-4xl">
        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold inline-block mb-6 animate-bounce">
          {isAr ? "📍 اعثر على وجبات مجانية بالقرب منك" : "📍 Find Free Meals Near You"}
        </span>
        <h1 className="font-black text-4xl md:text-7xl text-gray-900 leading-tight tracking-tight">
          {isAr ? "مطابخ غزة المجتمعية" : "Gaza Community Kitchens"}
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mt-6 mx-auto leading-relaxed max-w-2xl">
          {isAr
            ? "دليل تفاعلي للمطابخ المجتمعية النشطة التي تقدم وجبات مجانية لدعم صمود أهالينا في قطاع غزة."
            : "Locate active community kitchens providing free meals across Gaza to support our community."}
        </p>
      </header>

      <div className="w-full max-w-7xl">
        <ErrorBoundaryWrapper message={isAr ? "فشل تحميل قائمة المطابخ" : "Failed to load Kitchens list"}>
          <KitchensFilterClient lang={lang} kitchens={kitchens} />
        </ErrorBoundaryWrapper>
      </div>

      {/* قسم الأدوات السريعة: التبرع والبلاغات */}
      <section className="w-full max-w-6xl mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* بطاقة التبرع وتنسيق الدعم */}
        <div className="bg-emerald-600 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <Heart className="mb-4 opacity-80 group-hover:scale-110 transition-transform" size={40} />
            <h2 className="text-3xl font-black mb-4">
              {isAr ? "دعم استمرار المطبخ" : "Support the Kitchen"}
            </h2>
            <p className="mb-8 text-emerald-50 text-lg leading-relaxed">
              {isAr 
                ? "ساهم معنا في توفير المواد الغذائية الأساسية لضمان استمرار تقديم الوجبات اليومية للعائلات النازحة." 
                : "Help us provide essential food supplies to ensure daily meals continue for displaced families."}
            </p>
          </div>
          <a 
            href="https://wa.me/YOUR_PHONE_NUMBER" 
            target="_blank"
            className="bg-white text-emerald-700 px-8 py-5 rounded-2xl font-black hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 text-lg"
          >
            <MessageCircle size={24} />
            <span>{isAr ? "تنسيق تبرع عبر واتساب" : "Coordinate via WhatsApp"}</span>
          </a>
          <div className="absolute -right-10 -bottom-10 bg-emerald-500 w-40 h-40 rounded-full opacity-20 group-hover:scale-150 transition-all duration-700" />
        </div>

        {/* بطاقة بلاغات المناطق المحرومة */}
        <div className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-emerald-200 flex flex-col justify-between shadow-sm hover:border-emerald-400 transition-colors">
          <div>
            <AlertTriangle className="mb-4 text-orange-500" size={40} />
            <h2 className="text-3xl font-black text-gray-800 mb-4">
              {isAr ? "بلاغ عن منطقة محرومة" : "Report Underserved Area"}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              {isAr 
                ? "هل تعرف منطقة تعاني من نقص حاد ولا يصلها التوزيع؟ أخبرنا لنقوم بتوجيه الفرق الميدانية إليها." 
                : "Know an area with severe shortages and no distribution? Let us know so we can direct our field teams."}
            </p>
          </div>
          <button className="w-full bg-gray-900 text-white px-8 py-5 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95 text-lg">
            {isAr ? "تقديم طلب وصول" : "Request Access Support"}
          </button>
        </div>
      </section>

      {/* قسم التغذية الإرشادي */}
      <div className="w-full mt-24 max-w-7xl">
        <ErrorBoundaryWrapper message={isAr ? "فشل تحميل قسم التغذية" : "Failed to load Nutrition Section"}>
          <NutritionSectionClient lang={lang} />
        </ErrorBoundaryWrapper>
      </div>

      {/* Footer بسيط */}
      <footer className="mt-20 text-gray-400 text-sm font-medium">
        {isAr ? "© 2024 تكية غزة المجتمعية - يد واحدة تدعم الجميع" : "© 2024 Gaza Community Kitchen - One hand supports all"}
      </footer>
    </div>
  );
}