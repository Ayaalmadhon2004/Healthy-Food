"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import MonthlyDashboard from "@/components/mealTracker/MonthlyDashboard";
import { 
  getMonthlyGridDataAction, 
  getMonthlyStatsAction 
} from "@/app/actions/mealActions";
import { useLanguage } from "@/context/LanguageContext";

export default function MonthlyAnalyticsPage() {
  const { lang } = useLanguage();
  const [monthlyData, setMonthlyData] = useState({});
  const [stats, setStats] = useState({ avgCalories: 0, commitmentDays: 0, totalMeals: 0 });
  const [loading, setLoading] = useState(true);

  const fetchMonthlyData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const [gridRes, statsRes] = await Promise.all([
        getMonthlyGridDataAction(user.id, currentYear, currentMonth),
        getMonthlyStatsAction(user.id, currentYear, currentMonth)
      ]);

      if (gridRes.success) {
        setMonthlyData(gridRes.dailyTotals);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary-light)]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-bold">
            {lang === 'ar' ? "جاري تحميل الإحصائيات..." : "Loading Analytics..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-10 bg-[var(--color-primary-light)]">
      <div className="max-w-6xl mx-auto">
        <MonthlyDashboard 
          data={monthlyData} 
          stats={stats} 
          lang={lang} 
        />
      </div>
    </main>
  );
}