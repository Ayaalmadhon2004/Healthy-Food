"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Clock, Activity } from "lucide-react";
import { memo } from "react";

// تحميل الأزرار التفاعلية فقط عند حاجة المستخدم إليها
const AddToFavButton = dynamic(() => import("./AddToFavButton"), { 
  ssr: false,
  loading: () => <div className="h-10 bg-gray-50 animate-pulse rounded-xl" /> 
});
const ViewButton = dynamic(() => import("../ViewButton"), { 
  ssr: false,
  loading: () => <div className="h-10 bg-gray-50 animate-pulse rounded-xl" /> 
});

const RecipeCard = ({ meal, lang, index }) => {
  const isRtl = lang === "ar";

  return (
    // استخدام article بدلاً من div يحسن الـ SEO والـ Accessibility
    <article className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* حاوية الصورة: منع CLS عبر حجز المساحة مسبقاً */}
      <div className="relative w-full h-52 bg-gray-100 overflow-hidden">
        <Image
          src={meal.img}
          alt={meal.title[lang]} // SEO: وصف دقيق للصورة
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={index < 4} // Performance: تحميل فوري لأول 4 كروت
          quality={80}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* شارة النوع فوق الصورة تعطي شكلاً احترافياً */}
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`}>
           <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-green-700 uppercase shadow-sm">
            {meal.type[lang]}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* العنوان: استخدام h3 مع تحسين الظهور لمحركات البحث */}
        <h3 className="font-extrabold text-lg text-gray-900 mb-3 line-clamp-1 group-hover:text-green-600 transition-colors">
          {meal.title[lang]}
        </h3>

        {/* أيقونات المعلومات: تبسيط الـ DOM لتقليل وقت المعالجة */}
        <div className="flex items-center gap-4 text-gray-500 text-[11px] mb-6 font-bold">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
            <Clock size={14} className="text-green-500" />
            <span>{meal.time[lang]}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
            <Activity size={14} className="text-orange-400" />
            <span>{meal.cal[lang]}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <div className="flex-1">
             <ViewButton id={meal.id} />
          </div>
          <div className="w-12">
             <AddToFavButton meal={meal} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default memo(RecipeCard);