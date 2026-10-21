"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useUserData } from "@/hooks/useUserData";
import Link from "next/link";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAllReportsAction } from "@/app/actions/reportActions";

interface StatCardProps {
  title: string;
  value: string;
  isAr: boolean;
}

interface AreaReportRow {
  id: number;
  areaName: string;
  description: string;
}

const StatCard = ({ title, value, isAr }: StatCardProps) => (
  <div className="border-t-2 border-ink pt-3" dir={isAr ? "rtl" : "ltr"}>
    <p className="text-sm text-ink-soft font-medium">{title}</p>
    <p className="text-4xl font-medium text-ink mt-1 tabular-nums font-display">{value}</p>
  </div>
);

export default function DashboardHome() {
  const { lang } = useLanguage();
  const { user, loading } = useUserData();
  const isAr = lang === "ar";
  const searchParams = useSearchParams();
  const isReportSuccess = searchParams.get("success") === "true";

  const [reports, setReports] = useState<AreaReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // تأمين استخراج البيانات
  const userRole = user?.role?.toUpperCase()?.trim(); 
  const userName = user?.name || (isAr ? "بك" : "there");

  useEffect(() => {
    if (userRole === "ORG" || userRole === "ADMIN") {
      const fetchReports = async () => {
        setReportsLoading(true);
        const result = await getAllReportsAction();
        if (result.success && result.reports) setReports(result.reports);
        setReportsLoading(false);
      };
      fetchReports();
    }
  }, [userRole]);

  // 1. حماية التحميل (تمنع أي ظهور مفاجئ للواجهات)
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-olive-700" size={28} />
        <p className="text-ink-mute">{isAr ? "جاري تحميل بياناتك..." : "Loading your data..."}</p>
      </div>
    );
  }

  // 2. واجهة الأدوار الإدارية (ORG / ADMIN / DOCTOR)
  if (userRole === "ORG" || userRole === "ADMIN" || userRole === "DOCTOR") {
    const stats = userRole === "ORG" || userRole === "ADMIN" ? [
      { title: isAr ? "الوجبات الموزعة" : "Meals distributed", value: "1,240" },
      { title: isAr ? "السعة التشغيلية" : "Kitchen capacity", value: "90%" },
      { title: isAr ? "بلاغات المناطق" : "Area reports", value: reports.length.toString() },
    ] : [
      { title: isAr ? "إجمالي المرضى" : "Total patients", value: "48" },
      { title: isAr ? "مواعيد اليوم" : "Today's appointments", value: "6" },
      { title: isAr ? "تنبيهات صحية" : "Health alerts", value: "3" },
    ];

    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
        <header className="mb-8 text-start">
          <h1 className="text-3xl md:text-4xl font-medium text-ink">
            {isAr ? `لوحة التحكم: ${userName}` : `${userName}'s dashboard`}
          </h1>
          <p className="text-ink-soft text-lg mt-2">
            {isAr ? "ملخص سريع لأرقامك الحالية." : "A quick summary of where things stand."}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 mb-14">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} isAr={isAr} />
          ))}
        </div>

        {(userRole === "ORG" || userRole === "ADMIN") && (
          <div className="space-y-6 text-start">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-medium text-ink">{isAr ? "آخر بلاغات الاحتياج" : "Recent area reports"}</h2>
              <Link href="/dashboard/reports" className="text-link text-sm">{isAr ? "عرض الكل" : "View all"}</Link>
            </div>
            <div className="surface overflow-hidden">
              {reportsLoading ? (
                <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-ink-mute" /></div>
              ) : reports.length === 0 ? (
                <div className="p-10 text-center text-ink-mute">{isAr ? "لا توجد بلاغات حالياً" : "No reports available"}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-paper-deep border-b border-line">
                      <tr>
                        <th className="px-5 py-3 text-start text-sm font-medium text-ink-mute">{isAr ? "المنطقة" : "Area"}</th>
                        <th className="px-5 py-3 text-start text-sm font-medium text-ink-mute">{isAr ? "الوصف" : "Description"}</th>
                        <th className="px-5 py-3 text-start text-sm font-medium text-ink-mute">{isAr ? "الحالة" : "Status"}</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {reports.slice(0, 5).map((report) => (
                        <tr key={report.id} className="hover:bg-paper transition-colors">
                          <td className="px-5 py-4 font-medium text-ink">{report.areaName}</td>
                          <td className="px-5 py-4 text-ink-soft max-w-xs truncate">{report.description}</td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-clay-700">{isAr ? "قيد المراجعة" : "Pending"}</span>
                          </td>
                          <td className="px-5 py-4 text-end">
                            <ArrowRight size={18} strokeWidth={1.75} className={`text-ink-mute ${isAr ? "rotate-180" : ""}`} aria-hidden="true" />
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

  // 3. واجهة المستخدم العادي (USER) - محددة بشرط صريح
  if (userRole === "USER") {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
        <header className="mb-10 text-start">
          <h1 className="text-3xl md:text-4xl font-medium text-ink">
            {isAr ? `أهلاً ${userName}` : `Hello, ${userName}`}
          </h1>
          <p className="text-ink-soft text-lg mt-2">
            {isAr ? "ماذا أكلت اليوم؟" : "What have you eaten today?"}
          </p>
        </header>

        {isReportSuccess && (
          <div role="status" className="bg-olive-50 border border-olive-200 px-4 py-3 rounded-lg mb-8 text-start flex items-center gap-3 text-olive-900">
            <CheckCircle className="text-olive-700 shrink-0" size={20} strokeWidth={1.75} />
            <p className="font-medium">{isAr ? "وصلنا بلاغك عن المنطقة. شكراً لك." : "We got your area report. Thank you."}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 text-start">
          <Link href="/tracker" className="group">
            <div className="bg-olive-800 text-white p-7 md:p-8 rounded-xl h-full min-h-[240px] flex flex-col justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">{isAr ? "سجّل وجباتك" : "Log your meals"}</h2>
                <p className="text-olive-100 text-lg">{isAr ? "دوّن ما أكلته اليوم وتابع سعراتك." : "Write down what you ate today and keep an eye on your calories."}</p>
              </div>
              <span className="inline-flex items-center gap-2 font-semibold underline underline-offset-[6px] decoration-clay-400 decoration-2">
                {isAr ? "افتح المتابعة اليومية" : "Open the daily tracker"} <ArrowRight size={18} strokeWidth={1.75} className={isAr ? "rotate-180" : ""} aria-hidden="true" />
              </span>
            </div>
          </Link>
          <Link href="/dashboard/tracker/monthly" className="group">
            <div className="surface p-7 md:p-8 h-full min-h-[240px] flex flex-col justify-between group-hover:border-line-strong">
              <div>
                <h2 className="text-2xl font-medium text-ink mb-2">{isAr ? "هذا الشهر" : "This month"}</h2>
                <p className="text-ink-soft">{isAr ? "راجع كيف سار الشهر: عدد الوجبات ومتوسط السعرات." : "See how the month went: meals logged and average calories."}</p>
              </div>
              <span className="inline-flex items-center gap-2 font-semibold text-olive-800">
                {isAr ? "عرض الملخص" : "View summary"} <ArrowRight size={18} strokeWidth={1.75} className={isAr ? "rotate-180" : ""} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // 4. الحصن النهائي: إذا لم يتحقق أي شرط (لمنع ظهور الـ Tracker بالخطأ)
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-ink-mute" size={26} />
    </div>
  );
}