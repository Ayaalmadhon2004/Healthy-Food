import { cookies } from "next/headers";
import * as trackerActions from "@/app/actions/trackerActions";

export default async function MonthlyTrackerPage() {
  // 1. إدارة اللغة من الكوكيز
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const isAr = lang === "ar";
  
  // 2. إعداد التاريخ الحالي
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; 

  // 3. جلب البيانات باستخدام الـ Alias (trackerActions)
  // هذا السطر يجب أن يكون داخل الدالة (Function Body)
  const result = await trackerActions.getUserMonthlyLogsAction("user-test-123", year, month);
  const logs = result?.logs || [];
  const success = result?.success || false;

  const t = {
    ar: {
      title: "المتتبع الشهري",
      desc: "نظرة شاملة على استهلاكك للسعرات هذا الشهر",
      empty: "لم تقم بتسجيل أي وجبات بعد لهذا الشهر.",
      calories: "سعرة"
    },
    en: {
      title: "Monthly Tracker",
      desc: "A comprehensive look at your calories this month",
      empty: "You haven't recorded any meals for this month yet.",
      calories: "Cal"
    }
  }[lang];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8" dir={isAr ? "rtl" : "ltr"}>
      <header className="border-b pb-6">
        <h1 className="text-3xl font-black text-gray-900">{t.title}</h1>
        <p className="text-gray-500 mt-2">{t.desc}</p>
      </header>

      <main className="grid gap-4">
        {success && logs.length > 0 ? (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="flex justify-between items-center p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-800">{log.mealName}</span>
                <span className="text-sm text-gray-400 capitalize">{log.mealType || "Meal"}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-orange-500">{log.calories}</span>
                <span className="text-xs text-gray-400 block">{t.calories}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🍽️</div>
            <p className="text-gray-400 font-medium">{t.empty}</p>
          </div>
        )}
      </main>
    </div>
  );
}