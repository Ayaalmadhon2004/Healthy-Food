"use client";
import MonthlyGrid from "@/components/mealTracker/MonthlyGrid";

export default function MonthlyDashboard({ data, stats, lang }) {
  const isRtl = lang === "ar";

  const avg = stats?.avgCalories || 0;
  const commitment = stats?.commitmentDays || 0;
  const total = stats?.totalMeals || 0;
  
  return (
    <section className="mt-12 w-full animate-in fade-in duration-700">
      <h2 className="text-2xl font-black text-gray-800 mb-6 px-2">
        {isRtl ? "تحليلات الشهر" : "Monthly Analytics"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard 
          label={isRtl ? "متوسط الاستهلاك" : "Avg Calories"} 
          value={avg} 
          unit="cal" 
          color="blue"
        />
        <StatCard 
          label={isRtl ? "أيام الالتزام" : "Commitment Days"} 
          value={commitment} 
          unit={isRtl ? "يوم" : "days"} 
          color="green"
        />
        <StatCard 
          label={isRtl ? "إجمالي الوجبات" : "Total Meals"} 
          value={total} 
          unit={isRtl ? "وجبة" : "meals"} 
          color="orange"
        />
      </div>

      <MonthlyGrid 
        dailyTotals={data || {}}
        year={new Date().getFullYear()} 
        month={new Date().getMonth() + 1} 
        lang={lang} 
      />
    </section>
  );
}

function StatCard({ label, value, unit, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <div className={`p-5 rounded-[1.5rem] border ${colors[color]} shadow-sm`}>
      <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-xs opacity-80">{unit}</span>
      </div>
    </div>
  );
}