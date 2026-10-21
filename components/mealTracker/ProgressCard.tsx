"use client";

import { useLanguage } from "@/context/LanguageContext";
import { memo, useMemo, useState } from "react";

interface ProgressCardProps {
  calories: number;
  goal?: number;
  onGoalChange?: (value: string) => Promise<{ success?: boolean; error?: string } | undefined>;
}

const ProgressCard = memo(({ calories, goal = 2000, onGoalChange }: ProgressCardProps) => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { percent, remaining, statusColor } = useMemo(() => {
    const p = Math.min(100, Math.round((calories / goal) * 100));
    const r = Math.max(goal - calories, 0);
    
    let color = "bg-olive-700"; 
    if (p >= 70 && p < 100) color = "bg-ochre-500";
    if (p >= 100) color = "bg-clay-700";
    
    return { percent: p, remaining: r, statusColor: color };
  }, [calories, goal]);

  const content = {
    title: { en: "Today's Goal", ar: "هدف اليوم" },
    unit: { en: "calories", ar: "سعرة حرارية" },
    remaining: { en: "calories remaining", ar: "سعرة متبقية" },
    edit: { en: "Change goal", ar: "تغيير الهدف" },
    save: { en: "Save", ar: "حفظ" },
    cancel: { en: "Cancel", ar: "إلغاء" },
    invalid: { en: "Enter a whole number between 800 and 6000", ar: "أدخل رقماً صحيحاً بين 800 و6000" },
    failed: { en: "Could not save the goal", ar: "تعذر حفظ الهدف" },
  };

  const startEdit = () => {
    setDraft(String(goal));
    setError("");
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const result = await onGoalChange?.(draft);
    setSaving(false);
    if (result?.success) setEditing(false);
    else setError(result?.error === "INVALID_GOAL" ? content.invalid[lang] : content.failed[lang]);
  };

  return (
    <div 
      className="surface w-full h-auto p-6"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-ink">{content.title[lang]}</h3>
        <span className="font-medium text-olive-800 tabular-nums">
          {percent}%
        </span>
      </div>

      <div className="mb-4 font-bold flex items-baseline gap-1">
        <span className="text-4xl text-gray-900 tracking-tight">{calories}</span>
        <span className="text-ink-mute text-lg">/ {goal}</span>
        <span className="text-sm text-ink-mute font-medium mx-1">{content.unit[lang]}</span>
      </div>

      <div className="w-full h-2.5 bg-paper-deep rounded-sm mb-6 overflow-hidden">
        <div
          className={`h-full transition-[width] duration-500 ease-out ${statusColor}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                {remaining.toLocaleString()} {content.remaining[lang]}
      </p>

      {onGoalChange && (
        <div className="mt-4">
          {editing ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="800"
                max="6000"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-28 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm"
                aria-label={content.edit[lang]}
              />
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-olive-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {content.save[lang]}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-lg text-ink-mute text-sm font-semibold"
              >
                {content.cancel[lang]}
              </button>
              {error && <p className="w-full text-brick-600 text-xs font-semibold">{error}</p>}
            </div>
          ) : (
            <button type="button" onClick={startEdit} className="text-sm font-bold text-green-800 underline underline-offset-4">
              {content.edit[lang]}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

ProgressCard.displayName = "ProgressCard";

export default ProgressCard;