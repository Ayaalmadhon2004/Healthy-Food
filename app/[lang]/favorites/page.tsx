"use client";

import Link from "@/components/LocaleLink";
import { useFavStore } from "@/store/useFavStore";
import { useLanguage } from "@/context/LanguageContext";
import { useUserData } from "@/hooks/useUserData";
import { Trash2 } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { asLocalized } from "@/lib/types";

export default function FavoritesPage() {
  const { lang } = useLanguage();
  const { user } = useUserData();
  const favItems = useFavStore((state) => state.favItems);
  const toggleFavorite = useFavStore((state) => state.toggleFavorite);

  const isRtl = lang === "ar";

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20" dir={isRtl ? "rtl" : "ltr"}>
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-medium text-ink">
          {isRtl ? "وصفاتك المحفوظة" : "Your saved recipes"}
        </h1>
        {favItems.length > 0 && (
          <p className="mt-3 text-ink-soft text-lg">
            {isRtl ? `عدد الوصفات المحفوظة: ${favItems.length}` : `${favItems.length} saved so far`}
          </p>
        )}
      </header>

      {favItems.length === 0 ? (
        <div className="max-w-lg py-10 border-t border-line-strong">
          <p className="text-xl text-ink">{isRtl ? "لم تحفظ أي وصفة بعد." : "You haven't saved any recipes yet."}</p>
          <p className="mt-2 text-ink-soft">
            {isRtl ? "اضغط على القلب في أي وصفة لتجدها هنا لاحقاً." : "Tap the heart on a recipe and it will be waiting for you here."}
          </p>
          <Link href="/recipes" className="text-link mt-5 inline-block">
            {isRtl ? "تصفّح الوصفات" : "Browse recipes"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {favItems.map((fav) => {
            const item = { ...fav, img: String(fav.img ?? ""), title: asLocalized(fav.title), time: asLocalized(fav.time), cal: asLocalized(fav.cal) };
            return (
            <article key={item.id} className="surface overflow-hidden relative flex flex-col">

              {/* زر الحذف السريع - سلة المهملات */}
              <button
                onClick={() => toggleFavorite(fav, user?.id)}
                className="absolute top-2.5 end-2.5 z-10 w-9 h-9 flex items-center justify-center bg-white border border-line-strong rounded-md text-ink-soft hover:text-brick-700 hover:border-brick-300 transition-colors"
                title={isRtl ? "حذف من المفضلات" : "Remove from favorites"}
                aria-label={isRtl ? "حذف من المفضلات" : "Remove from favorites"}
              >
                <Trash2 size={17} strokeWidth={1.75} />
              </button>

              <Link href={`/recipes/${item.id}`} className="block">
                <div className="relative aspect-[4/3] bg-paper-deep border-b border-line">
                  <SafeImage
                    src={item.img}
                    kind="dish"
                    seed={item.id}
                    alt={item.title[lang]}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h2 className="text-lg font-semibold text-ink leading-snug">{item.title[lang]}</h2>
                  <p className="mt-1.5 flex gap-4 text-sm text-ink-soft">
                    <span>{item.time[lang]}</span>
                    <span>{item.cal[lang]}</span>
                  </p>
                </div>
              </Link>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
