"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useUserData } from "@/hooks/useUserData";
import Link from "next/link";
import { 
  PlusCircle, CalendarDays, ArrowRight, UtensilsCrossed,
  LineChart, Activity, Users, TrendingUp,
  CheckCircle, Loader2, ClipboardList, MapPin
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAllReportsAction } from "@/app/actions/reportActions";

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

export default function DashboardHome() {
  const { lang } = useLanguage();
  const { user, loading } = useUserData();
  const isAr = lang === "ar";
  const searchParams = useSearchParams();
  const isReportSuccess = searchParams.get("success") === "true";

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const userRole = user?.role?.toUpperCase()?.trim() || null;
  const userName = user?.name || user?.full_name || (isAr ? "مستخدم" : "User");

  useEffect(() => {
    if (userRole === "ORG") {
      const fetchReports = async () => {
        setReportsLoading(true);
        const result = await getAllReportsAction();
        if (result.success) setReports(result.reports);
        setReportsLoading(false);
      };
      fetchReports();
    }
  }, [userRole]);

  if (loading || !userRole) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-gray-400 font-bold">{isAr ? "جاري تحميل بياناتك..." : "Loading your data..."}</p>
      </div>
    );
  }

  // --- واجهة المستخدم العادي (USER) ---
  if (userRole === "USER") {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
        <header className="mb-10 text-start">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isAr ? `أهلاً، ${userName}!` : `Hi, ${userName}!`}
          </h1>
        </header>

        {isReportSuccess && (
          <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2.5rem] shadow-sm animate-in zoom-in slide-in-from-top-4 duration-500 mb-8 text-start">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-2 rounded-full text-white shadow-lg">
                <CheckCircle size={20} />
              </div>
              <div>
                <h4 className="font-black text-emerald-900">
                  {isAr ? "تم إرسال بلاغ المنطقة بنجاح!" : "Area Report Submitted!"}
                </h4>
                <p className="text-emerald-700 text-sm font-medium">
                  {isAr ? "شكراً لمساعدتنا، سيتم تتبع الحالة هنا." : "Thanks for helping. Tracking is active."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
          <Link href="/dashboard/tracker" className="group">
            <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden h-full min-h-[280px] flex flex-col justify-between">
              <PlusCircle className={`absolute ${isAr ? "-left-4" : "-right-4"} -top-4 w-40 h-40 text-emerald-400/30 rotate-12`} />
              <div>
                <UtensilsCrossed size={48} className="mb-6 text-emerald-100" />
                <h2 className="text-3xl font-bold mb-3">{isAr ? "المتتبع اليومي" : "Daily Tracker"}</h2>
                <p className="opacity-90 max-w-[250px]">{isAr ? "سجل وجباتك ونشاطك اليومي." : "Log your daily meals and activity."}</p>
              </div>
              <div className="bg-white text-emerald-600 font-bold px-6 py-3 rounded-full self-start flex items-center gap-2">
                {isAr ? "ابدأ التدوين الآن" : "Start Logging Now"} <ArrowRight size={18} className={isAr ? "rotate-180" : ""} />
              </div>
            </div>
          </Link>
          <Link href="/dashboard/tracker/monthly" className="group">
             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-xl transition-all relative overflow-hidden h-full min-h-[280px] flex flex-col justify-between">
              <CalendarDays className={`absolute ${isAr ? "-left-4" : "-right-4"} -top-4 w-40 h-40 text-blue-50/50 rotate-12`} />
              <div>
                <LineChart size={48} className="mb-6 text-blue-500" />
                <h2 className="text-3xl font-bold mb-3 text-gray-900">{isAr ? "العرض الشهري" : "Monthly View"}</h2>
                <p className="text-gray-500 max-w-[250px]">{isAr ? "راجع ملخص أدائك الصحي شهرياً." : "Review your health summary monthly."}</p>
              </div>
              <div className="bg-blue-50 text-blue-600 font-bold px-6 py-3 rounded-full border border-blue-100 self-start flex items-center gap-2">
                {isAr ? "عرض التقارير" : "View Reports"} <ArrowRight size={18} className={isAr ? "rotate-180" : ""} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // --- واجهة الأدوار الإدارية (ORG / DOCTOR) ---
  const stats = userRole === "ORG" ? [
    { title: isAr ? "الوجبات الموزعة" : "Meals Distributed", value: "1,240", icon: UtensilsCrossed, color: "bg-orange-500" },
    { title: isAr ? "السعة التشغيلية" : "Kitchen Capacity", value: "90%", icon: TrendingUp, color: "bg-emerald-500" },
    { title: isAr ? "بلاغات المناطق" : "Area Reports", value: reports.length.toString(), icon: ClipboardList, color: "bg-purple-500" },
  ] : [
    { title: isAr ? "إجمالي المرضى" : "Total Patients", value: "48", icon: Users, color: "bg-indigo-500" },
    { title: isAr ? "مواعيد اليوم" : "Today's Appts", value: "6", icon: CalendarDays, color: "bg-blue-500" },
    { title: isAr ? "تنبيهات صحية" : "Health Alerts", value: "3", icon: Activity, color: "bg-red-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <header className="mb-8 text-start">
        <h1 className="text-3xl font-black text-gray-900">
          {isAr ? `لوحة التحكم: ${userName}` : `${userName}'s Dashboard`}
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          {isAr ? "ملخص سريع لإحصائياتك الحالية." : "A quick summary of your current statistics."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} isAr={isAr} />
        ))}
      </div>

      {userRole === "ORG" && (
        <div className="space-y-6 text-start">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">{isAr ? "آخر بلاغات الاحتياج" : "Recent Area Reports"}</h2>
            <Link href="/dashboard/reports" className="text-emerald-600 font-bold text-sm hover:underline">{isAr ? "عرض الكل" : "View All"}</Link>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
            {reportsLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-gray-300" /></div>
            ) : reports.length === 0 ? (
              <div className="p-10 text-center text-gray-400">{isAr ? "لا توجد بلاغات حالياً" : "No reports available"}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-6 text-start text-xs font-black text-gray-400 uppercase">{isAr ? "المنطقة" : "Area"}</th>
                      <th className="p-6 text-start text-xs font-black text-gray-400 uppercase">{isAr ? "العائلات" : "Families"}</th>
                      <th className="p-6 text-start text-xs font-black text-gray-400 uppercase">{isAr ? "الحالة" : "Status"}</th>
                      <th className="p-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reports.slice(0, 5).map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><MapPin size={18} /></div>
                            <span className="font-bold text-gray-800">{report.areaName}</span>
                          </div>
                        </td>
                        <td className="p-6 font-bold text-gray-600">{report.familyCount}</td>
                        <td className="p-6">
                          <span className="px-4 py-1.5 rounded-full text-xs font-black bg-orange-100 text-orange-600 uppercase">Pending</span>
                        </td>
                        <td className="p-6 text-end">
                          <ArrowRight size={20} className={`text-gray-300 ${isAr ? "rotate-180" : ""}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}