"use client";

import { useState, useMemo } from "react";
import { MapPin, Clock, Phone } from "lucide-react";
import MealRegistration from "@/components/kitchen/MealRegistration";
import SafeImage from "@/components/SafeImage";
import { pickText, type KitchenView, type Lang } from "@/lib/types";

const REGIONS = [
  { id: "ALL", en: "All", ar: "الكل" },
  { id: "North", en: "North", ar: "الشمال" },
  { id: "Gaza", en: "Gaza", ar: "غزة" },
  { id: "Middle", en: "Middle", ar: "الوسطى" },
  { id: "Khan Younis", en: "Khan Younis", ar: "خانيونس" },
  { id: "Rafah", en: "Rafah", ar: "رفح" },
];

export default function KitchensFilterClient({ kitchens, lang }: { kitchens: KitchenView[]; lang: Lang }) {
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const isAr = lang === "ar";

  // Regions that appear in the data but not in the fixed list still get a chip.
  const regions = useMemo(() => {
    const known = new Set(REGIONS.map((r) => r.id.toLowerCase()));
    const extra: typeof REGIONS = [];
    for (const k of kitchens) {
      const en = pickText(k.region, "en");
      if (en && !known.has(en.toLowerCase())) {
        known.add(en.toLowerCase());
        extra.push({ id: en, en, ar: pickText(k.region, "ar") || en });
      }
    }
    return [...REGIONS, ...extra];
  }, [kitchens]);

  const filteredKitchens = useMemo(() => {
    if (selectedRegion === "ALL") return kitchens;

    return kitchens.filter((k) => {
      const kitchenRegion = pickText(k.region, "en").toLowerCase();
      const targetRegion = selectedRegion.toLowerCase();
      return kitchenRegion === targetRegion;
    });
  }, [selectedRegion, kitchens]);

  const countLabel = isAr
    ? `${filteredKitchens.length} ${filteredKitchens.length === 1 ? "مطبخ" : "مطبخاً"}`
    : `${filteredKitchens.length} ${filteredKitchens.length === 1 ? "kitchen" : "kitchens"}`;

  return (
    <div className="w-full" dir={isAr ? "rtl" : "ltr"}>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-8">
        <nav className="flex flex-wrap gap-2" aria-label={isAr ? "تصفية حسب المنطقة" : "Filter by region"}>
          {regions.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => setSelectedRegion(region.id)}
              aria-pressed={selectedRegion === region.id}
              className="chip"
            >
              {isAr ? region.ar : region.en}
            </button>
          ))}
        </nav>
        <p className="text-sm text-ink-mute" aria-live="polite">{countLabel}</p>
      </div>

      {filteredKitchens.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line-strong rounded-lg">
          <p className="text-ink-soft text-lg">
            {isAr ? "لا توجد مطابخ في هذه المنطقة حالياً." : "No kitchens listed in this region yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredKitchens.map((kitchen) => {
            const name = pickText(kitchen.name, lang);
            return (
              <article
                key={kitchen.id}
                className="surface flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/9] bg-paper-deep border-b border-line">
                  <SafeImage
                    kind="kitchen"
                    seed={kitchen.id}
                    alt={isAr ? `مطبخ ${name}` : `${name} kitchen`}
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-semibold text-xl text-ink leading-snug">{name}</h2>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                    <MapPin size={15} strokeWidth={1.75} className="text-clay-600 shrink-0" aria-hidden="true" />
                    {pickText(kitchen.region, lang)}
                  </p>

                  <dl className="mt-5 space-y-3 text-[0.9375rem]">
                    <div className="flex items-start gap-3">
                      <Clock size={17} strokeWidth={1.75} className="text-ink-mute mt-1 shrink-0" aria-hidden="true" />
                      <div>
                        <dt className="text-xs text-ink-mute">{isAr ? "وقت التوزيع" : "Served at"}</dt>
                        <dd className="text-ink font-medium">{pickText(kitchen.distributionTime, lang)}</dd>
                      </div>
                    </div>

                    <div className="border-s-2 border-ochre-400 ps-3">
                      <dt className="text-xs text-ink-mute">{isAr ? "وجبة اليوم" : "On the menu today"}</dt>
                      <dd className="text-ink font-semibold text-lg leading-snug">{pickText(kitchen.todaysMeal, lang)}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-6">
                    <div className="pt-5 border-t border-line">
                      <MealRegistration
                        kitchenId={kitchen.id}
                        capacity={kitchen.capacityLimit}
                        initialCount={kitchen.reservedTomorrow || 0}
                        lang={lang}
                      />
                    </div>

                    {kitchen.contact && (
                      <a
                        href={`tel:${kitchen.contact}`}
                        className="mt-4 flex items-center gap-2 text-sm text-ink-soft hover:text-olive-800"
                      >
                        <Phone size={15} strokeWidth={1.75} aria-hidden="true" />
                        <span dir="ltr">{kitchen.contact}</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
