import Link from "next/link";
import { cookies } from "next/headers";
import HomeAnimatedSections from "@/components/HomeAnimatedSections";
import { 
  Utensils, Heart, MapPin, Users, Activity, ShieldCheck, ArrowRight, ChevronDown
} from "lucide-react";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const isAr = lang === "ar";

  const t = {
    heroTag: isAr ? "من قلب غزة .. نبض الصمود" : "From the heart of Gaza.. Pulse of Resilience",
    heroTitle: isAr ? "غزة نبض" : "GAZA PULSE",
    heroSub: isAr ? "أول منصة تفاعلية ذكية لتعزيز الأمن الغذائي الميداني وتحليل الاحتياجات الصحية في قطاع غزة." : "The first interactive AI platform to enhance field food security and health needs in the Gaza Strip.",
    explore: isAr ? "استكشف الوصفات" : "Explore Recipes",
    dashboard: isAr ? "لوحة التحكم" : "Control Dashboard",
    stats: [
      { label: isAr ? "وجبة ميدانية" : "Field Meals", val: "+50K", icon: <Utensils /> },
      { label: isAr ? "وصفة بديلة" : "Alternative Recipes", val: "120", icon: <Heart /> },
      { label: isAr ? "نقطة توزيع" : "Distribution Points", val: "24", icon: <MapPin /> },
      { label: isAr ? "متطوع نشط" : "Active Volunteers", val: "+300", icon: <Users /> },
    ]
  };

 

  return (
    <div className={`w-full overflow-hidden bg-white ${isAr ? "font-arabic" : "font-sans"}`} dir={isAr ? "rtl" : "ltr"}>
      
      {/* SECTION 1: HERO (THE WOW START) */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block px-5 py-2 rounded-full bg-green-100 text-green-700 text-sm font-black mb-8 uppercase tracking-widest">
            {t.heroTag}
          </span>
          <h1 className="text-7xl md:text-[10rem] font-black leading-none mb-8 tracking-tighter text-gray-900">
            {t.heroTitle}<span className="text-green-600">.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
            {t.heroSub}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/recipes" className="group px-10 py-5 bg-green-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-green-200 flex items-center gap-3 hover:bg-green-700 transition-all">
              {t.explore} <ArrowRight className={isAr ? "rotate-180" : ""} />
            </Link>
            <Link href="/dashboard" className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-bold text-lg hover:border-green-600 transition-all">
              {t.dashboard}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 text-gray-300 animate-bounce">
          <ChevronDown size={40} />
        </div>
      </section>

      {/* SECTION 2: LIVE METRICS (REAL-TIME IMPACT) */}
      <HomeAnimatedSections stats={t.stats} isAr={isAr} />

      {/* SECTION 4: ALTERNATIVE RECIPES (THE KITCHEN) */}
      <section className="py-32 bg-green-50 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-20">
              <h2 className="text-5xl font-black mb-6">{isAr ? "مطبخ غزة البديل" : "Gaza's Alternative Kitchen"}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{isAr ? "وصفات تعتمد على المكونات المتوفرة في وقت الأزمات لضمان التغذية السليمة." : "Recipes based on available ingredients during crises to ensure proper nutrition."}</p>
           </div>
           <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                   <div className="h-48 w-full bg-gray-100 rounded-2xl mb-6 overflow-hidden">
                      <div className="w-full h-full bg-green-200 animate-pulse" />
                   </div>
                   <h4 className="text-2xl font-bold mb-3">{isAr ? "وصفة مجدرة بالعدس" : "Lentil Mujadara"}</h4>
                   <p className="text-gray-500 mb-6 text-sm">Rich in protein, uses minimal water.</p>
                   <button className="text-green-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                     {isAr ? "عرض التفاصيل" : "View Details"} <ArrowRight size={18} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 5: DOCTORS & TIPS (HEALTH GUIDANCE) */}
      <section className="py-32 px-6 bg-white">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-6">
               <div className="space-y-6">
                  <div className="h-64 bg-green-600 rounded-3xl" />
                  <div className="h-48 bg-gray-900 rounded-3xl" />
               </div>
               <div className="space-y-6 pt-12">
                  <div className="h-48 bg-gray-100 rounded-3xl" />
                  <div className="h-64 bg-green-100 rounded-3xl" />
               </div>
            </div>
            <div className="order-1 lg:order-2">
               <h2 className="text-5xl font-black mb-8 leading-tight">{isAr ? "إرشادات طبية على مدار الساعة" : "24/7 Medical Guidance"}</h2>
               <p className="text-xl text-gray-600 mb-12">{isAr ? "نخبة من الأطباء المتخصصين يقدمون نصائح صحية يومية للتعامل مع سوء التغذية." : "Elite specialized doctors provide daily health tips to handle malnutrition."}</p>
               <Link href="/tips" className="text-lg font-bold underline underline-offset-8 decoration-green-600">
                  {isAr ? "تصفح النصائح الصحية" : "Browse Health Tips"}
               </Link>
            </div>
         </div>
      </section>

      {/* SECTION 6: THE CALL (JOIN THE RESILIENCE) */}
      <section className="py-20 px-6">
         <div className="max-w-7xl mx-auto bg-green-600 rounded-[4rem] p-16 text-center text-white relative overflow-hidden">
            <h2 className="text-5xl md:text-7xl font-black mb-8 relative z-10">{isAr ? "كن جزءاً من النبض" : "Be Part of the Pulse"}</h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto relative z-10">{isAr ? "سجل الآن كمتطوع أو منظمة للمساهمة في دعم أهالينا في غزة." : "Register now as a volunteer or organization to contribute in supporting our people in Gaza."}</p>
            <div className="flex justify-center gap-6 relative z-10">
               <Link href="/signup" className="px-12 py-5 bg-white text-green-700 rounded-2xl font-black hover:scale-105 transition-transform">
                  {isAr ? "انضم إلينا" : "Join Us"}
               </Link>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
         </div>
      </section>

    </div>
  );
}