"use client";
import MonthlyGrid from "@/components/mealTracker/MonthlyGrid";

export interface MonthlyStats {
    avgCalories?: number;
    commitmentDays?: number;
    totalMeals?: number;
    goal?: number;
}

export default function MonthlyDashboard({ data = {}, stats = {}, lang }: {
    data?: Record<string, number>;
    stats?: MonthlyStats;
    lang: string;
}) { 
    const isRtl = lang === "ar";
    
    const formattedGridData = Object.entries(data).reduce<Record<number, number>>((acc, [key, value]) => {
        acc[parseInt(key)] = value;
        return acc;
    }, {});

    const avg = stats?.avgCalories || 0;
    const commitment = stats?.commitmentDays || 0;
    const total = stats?.totalMeals || 0;

    return (
        <section className="w-full settle">
        <h2 className="text-3xl font-medium text-ink mb-8">
            {isRtl ? "ملخص الشهر" : "This month"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 mb-10">
            <StatCard label={isRtl ? "متوسط الاستهلاك" : "Average intake"} value={avg} unit={isRtl ? "سعرة" : "cal"} />
            <StatCard label={isRtl ? "أيام الالتزام" : "Days on track"} value={commitment} unit={isRtl ? "يوم" : "days"} />
            <StatCard label={isRtl ? "إجمالي الوجبات" : "Meals logged"} value={total} unit={isRtl ? "وجبة" : "meals"} />
        </div>

        <MonthlyGrid 
            key={JSON.stringify(formattedGridData)} 
            dailyTotals={formattedGridData}
            year={new Date().getFullYear()} 
            month={new Date().getMonth() + 1} 
            lang={lang} 
            goal={stats?.goal || 2000}
        />
        </section>
    );
    }

function StatCard({ label, value, unit }: {
    label: string;
    value: number;
    unit: string;
}) {
    return (
        <div className="border-t-2 border-ink pt-3">
        <p className="text-sm text-ink-soft font-medium">{label}</p>
        <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-medium font-display tabular-nums text-ink">{value}</span>
            <span className="text-sm text-ink-mute">{unit}</span>
        </p>
        </div>
    );
}
