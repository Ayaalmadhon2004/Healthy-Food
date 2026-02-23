// components/mealTracker/MonthlyGrid.jsx
"use client";

export default function MonthlyGrid({ dailyTotals, year, month, lang }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const goal = 2000; // هدف السعرات اليومي

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mt-10">
      <h3 className="text-xl font-bold mb-6 px-2">
        {lang === 'ar' ? 'سجل الشهر' : 'Monthly Log'}
      </h3>
      
      <div className="grid grid-cols-7 gap-2">
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const total = dailyTotals[day] || 0;
          const statusColor = total === 0 ? "bg-gray-50" : 
                              total > goal ? "bg-red-100 text-red-600" : 
                              "bg-green-100 text-green-600";

          return (
            <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-xl border border-gray-100 ${statusColor}`}>
              <span className="text-[10px] opacity-50">{day}</span>
              <span className="text-[10px] font-bold">{total > 0 ? total : '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}