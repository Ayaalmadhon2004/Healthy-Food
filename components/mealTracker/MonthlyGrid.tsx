// components/mealTracker/MonthlyGrid.jsx
"use client";

interface MonthlyGridProps {
  dailyTotals: Record<number, number>;
  year?: number;
  month?: number;
  lang: string;
  goal?: number;
}

export default function MonthlyGrid({ dailyTotals, year, month, lang, goal = 2000 }: MonthlyGridProps) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || (new Date().getMonth() + 1);
    
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  return (
    <div className="surface p-5 md:p-6">
      <h3 className="text-xl font-semibold mb-5 text-ink">
        {lang === 'ar' ? 'سجل الشهر' : `Daily log (${currentMonth}/${currentYear})`}
      </h3>
      
      <div className="grid grid-cols-7 gap-2">
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const total = dailyTotals[day] || 0;
          const statusColor = total === 0 ? "bg-paper text-ink-mute" :
                              total > goal ? "bg-clay-100 text-clay-800" :
                              "bg-olive-100 text-olive-900";

          return (
            <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-md border border-line ${statusColor}`}>
              <span className="text-xs opacity-70">{day}</span>
              <span className="text-xs font-semibold tabular-nums">{total > 0 ? total : '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}