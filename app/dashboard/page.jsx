"use client";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { 
  PlusCircle, 
  CalendarDays, 
  ArrowRight,
  UtensilsCrossed,
  LineChart,
  Activity,
  Users,
  Building2,
  TrendingUp
} from "lucide-react";

// مكون البطاقة الإحصائية للأدوار الإدارية
const StatCard = ({ title, value, icon: Icon, color, isAr }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow" dir={isAr ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <TrendingUp size={16} className="text-gray-400" />
    </div>
    <h3 className="text-gray-500 text-sm font-bold">{title}</h3>
    <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
  </div>
);

export default function DashboardHome({ userRole = "USER", userName = "User" }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  // --- 1. واجهة المستخدم العادي (مدخل التتبع) ---
  if (userRole === "USER") {
    return (
      <div className={`p-4 md:p-8 max-w-6xl mx-auto ${isAr ? "font-arabic" : ""}`} dir={isAr ? "rtl" : "ltr"}>
        <header className="mb-10 text-start">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isAr ? `أهلاً، ${userName}!` : `Hi, ${userName}!`}
          </h1>
          <p className="text-gray-500 font-medium mt-3 text-lg">
            {isAr 
              ? "ابدأ رحلتك الصحية اليوم من خلال أدوات التتبع الخاصة بك." 
              : "Start your health journey today using your tracking tools."}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* كارت المتتبع اليومي */}
          <Link href="/dashboard/daily-tracker" className="group">
            <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden h-full min-h-[280px] flex flex-col justify-between">
              <PlusCircle className={`absolute ${isAr ? "-left-4" : "-right-4"} -top-4 w-40 h-40 text-emerald-400/30 rotate-12`} />
              <div>
                <UtensilsCrossed size={48} className="mb-6 text-emerald-100" />
                <h2 className="text-3xl font-bold mb-3">
                  {isAr ? "المتتبع اليومي" : "Daily Tracker"}
                </h2>
                <p className="text-emerald-50 text-base opacity-90 max-w-[250px] leading-relaxed">
                  {isAr 
                    ? "سجل وجباتك، شرب الماء، ونشاطك البدني لهذا اليوم." 
                    : "Log your meals, water intake, and physical activity for today."}
                </p>
              </div>
              <div className="flex items-center gap-2 font-bold text-sm bg-white text-emerald-600 self-start px-6 py-3 rounded-full mt-6 group-hover:bg-emerald-50 transition-colors shadow-lg">
                {isAr ? "ابدأ التدوين الآن" : "Start Logging Now"}
                <ArrowRight size={18} className={isAr ? "rotate-180" : ""} />
              </div>
            </div>
          </Link>

          {/* كارت العرض الشهري */}
          <Link href="/dashboard/monthly-view" className="group">
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 relative overflow-hidden h-full min-h-[280px] flex flex-col justify-between">
              <CalendarDays className={`absolute ${isAr ? "-left-4" : "-right-4"} -top-4 w-40 h-40 text-blue-50/50 rotate-12`} />
              <div>
                <LineChart size={48} className="mb-6 text-blue-500" />
                <h2 className="text-3xl font-bold mb-3 text-gray-900">
                  {isAr ? "العرض الشهري" : "Monthly View"}
                </h2>
                <p className="text-gray-500 text-base max-w-[250px] leading-relaxed">
                  {isAr 
                    ? "راجع ملخص أدائك الصحي وتطورك على مدار الشهر." 
                    : "Review your health performance summary and progress over the month."}
                </p>
              </div>
              <div className="flex items-center gap-2 font-bold text-sm bg-blue-50 text-blue-600 self-start px-6 py-3 rounded-full mt-6 group-hover:bg-blue-100 transition-colors border border-blue-100">
                {isAr ? "عرض التقارير" : "View Reports"}
                <ArrowRight size={18} className={isAr ? "rotate-180" : ""} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // --- 2. واجهة الأدوار الإدارية (ORG / DOCTOR) ---
  const stats = userRole === "ORG" ? [
    { title: isAr ? "الوجبات الموزعة" : "Meals Distributed", value: "1,240", icon: UtensilsCrossed, color: "bg-orange-500" },
    { title: isAr ? "السعة التشغيلية" : "Kitchen Capacity", value: "90%", icon: TrendingUp, color: "bg-emerald-500" },
    { title: isAr ? "المطابخ النشطة" : "Active Kitchens", value: "8", icon: Building2, color: "bg-purple-500" },
  ] : [
    { title: isAr ? "إجمالي المرضى" : "Total Patients", value: "48", icon: Users, color: "bg-indigo-500" },
    { title: isAr ? "مواعيد اليوم" : "Today's Appts", value: "6", icon: CalendarDays, color: "bg-blue-500" },
    { title: isAr ? "تنبيهات صحية" : "Health Alerts", value: "3", icon: Activity, color: "bg-red-500" },
  ];

  return (
    <div className="p-4 md:p-8" dir={isAr ? "rtl" : "ltr"}>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          {isAr ? `لوحة التحكم: ${userName}` : `${userName}'s Dashboard`}
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          {isAr ? "ملخص سريع لإحصائياتك الحالية." : "A quick summary of your current statistics."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} isAr={isAr} />
        ))}
      </div>
    </div>
  );
}