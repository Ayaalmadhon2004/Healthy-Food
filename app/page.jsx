"use client";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/context/LanguageContext"; 

export default function Home() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  
  const { user, loading } = useUserData();
  console.log("User data in layout:", user);

  const content = {
    title: { 
      en: "Eat Healthy, Live Healthy", 
      ar: "كُل بوعي، لتعيش بصحة" 
    },
    description: { 
      en: "Discover delicious recipes, track your daily meals, and achieve your nutrition goals with our comprehensive healthy eating app.", 
      ar: "اكتشف وصفات شهية، تتبع وجباتك اليومية، وحقق أهدافك الغذائية من خلال تطبيقنا الشامل للأكل الصحي." 
    },
    btnBrowse: { 
      en: "Browse Recipes", 
      ar: "تصفح الوصفات" 
    },
    btnTrack: { 
      en: "Start Tracking", 
      ar: "ابدأ التتبع" 
    }
  };


  return (
    <div 
      className="bg-[var(--color-primary-light)] w-full min-h-screen text-center flex flex-col justify-center items-center gap-6 p-4 md:p-10"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h1 className="font-black text-3xl md:text-6xl text-gray-900 leading-tight animate-fade-in">
        {content.title[lang]}
      </h1>

      <p className="text-gray-600 text-lg md:text-2xl max-w-xl md:max-w-3xl leading-relaxed">
        {content.description[lang]}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-8">
        <button
          className="cursor-pointer bg-[var(--color-primary)] hover:bg-green-700 text-white font-bold rounded-2xl px-8 py-4 shadow-lg transition-all active:scale-95 text-lg"
          onClick={() => router.push("/recipes")}
        >
          {content.btnBrowse[lang]}
        </button>
        
        <button
          className="cursor-pointer bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-green-50 font-bold rounded-2xl px-8 py-4 shadow-md transition-all active:scale-95 text-lg"
          onClick={() => router.push("/tracker")}
        >
          {content.btnTrack[lang]}
        </button>
      </div>

      <div className="absolute bottom-10 opacity-20 pointer-events-none">
        <p className="text-sm font-medium">NutriFlow v2.0</p>
      </div>
    </div>
  );
}