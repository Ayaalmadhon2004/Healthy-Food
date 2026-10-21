"use client";
import dynamic from "next/dynamic";
import { Clock, Flame } from "lucide-react";
import { memo } from "react";
import SafeImage from "@/components/SafeImage";
import type { Lang, Recipe } from "@/lib/types";

// تحميل الأزرار التفاعلية فقط عند حاجة المستخدم إليها
const AddToFavButton = dynamic(() => import("./AddToFavButton"), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-lg bg-paper-deep" />
});
const ViewButton = dynamic(() => import("../ViewButton"), {
  ssr: false,
  loading: () => <div className="h-10 rounded-lg bg-paper-deep" />
});

const RecipeCard = ({ meal, lang, index }: { meal: Recipe; lang: Lang; index: number }) => {
  return (
    // استخدام article بدلاً من div يحسن الـ SEO والـ Accessibility
    <article className="surface overflow-hidden flex flex-col">

      {/* حاوية الصورة: منع CLS عبر حجز المساحة مسبقاً */}
      <div className="relative w-full aspect-[4/3] bg-paper-deep border-b border-line">
        <SafeImage
          src={meal.img}
          kind="dish"
          seed={meal.id}
          alt={meal.title[lang]} // SEO: وصف دقيق للصورة
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={index < 4} // Performance: تحميل فوري لأول 4 كروت
          quality={80}
          className="object-cover"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-clay-700 font-semibold">{meal.type[lang]}</p>

        <h3 className="mt-1 font-semibold text-lg text-ink leading-snug line-clamp-2">
          {meal.title[lang]}
        </h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} strokeWidth={1.75} className="text-ink-mute" aria-hidden="true" />
            {meal.time[lang]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flame size={14} strokeWidth={1.75} className="text-ink-mute" aria-hidden="true" />
            {meal.cal[lang]}
          </span>
        </p>

        <div className="mt-auto pt-4 flex items-center gap-2">
          <div className="flex-1">
            <ViewButton id={meal.id} />
          </div>
          <AddToFavButton meal={meal} />
        </div>
      </div>
    </article>
  );
};

export default memo(RecipeCard);
