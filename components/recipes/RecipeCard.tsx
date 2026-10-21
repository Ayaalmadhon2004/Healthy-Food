"use client";
import Link from "@/components/LocaleLink";
import { Clock, Flame } from "lucide-react";
import { memo } from "react";
import SafeImage from "@/components/SafeImage";
import AddToFavButton from "./AddToFavButton";
import type { Lang, Recipe } from "@/lib/types";

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
          fetchPriority={index === 0 ? "high" : undefined}
          quality={80}
          className="object-cover"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-clay-700 font-semibold">{meal.type[lang]}</p>

        <h2 className="mt-1 font-semibold text-lg text-ink leading-snug line-clamp-2">
          {meal.title[lang]}
        </h2>

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
          <Link href={`/recipes/${meal.id}`} className="btn btn-primary flex-1 !py-2 min-h-11">
            {lang === "ar" ? "عرض الوصفة" : "View recipe"}
            <span className="sr-only"> — {meal.title[lang]}</span>
          </Link>
          <AddToFavButton meal={meal} />
        </div>
      </div>
    </article>
  );
};

export default memo(RecipeCard);
