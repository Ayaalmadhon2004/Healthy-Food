import { cookies } from "next/headers";

export default async function MonthlyTrackerPage() {
    const cookieStore=await cookies();
    const lang=cookieStore.get("lang")?.value || "ar";
    const isAr=lang==="ar";

    const t = {
        ar: {
        title: "متتبع الوجبات الشهري",
        subtitle: "هنا سيظهر ملخص التزامك خلال الشهر",
        },
        en: {
        title: "Monthly Meal Tracker",
        subtitle: "Here is a summary of your commitment throughout the month",
        }
    }[lang];

    return (
        <div className="p-8 space-y-4" dir={isAr ? "rtl" : "ltr"}>
        <header className="space-y-1">
            <h1 className="text-3xl font-black text-gray-800">
            {t.title}
            </h1>
            <p className="text-gray-500 font-medium">
            {t.subtitle}
            </p>
        </header>

        {/* سنقوم بإضافة التقويم هنا في الخطوة القادمة */}
        <div className="mt-10 border-2 border-dashed border-gray-100 rounded-[2rem] h-64 flex items-center justify-center text-gray-300">
            {isAr ? "منطقة التقويم قيد الإنشاء..." : "Calendar section under construction..."}
        </div>
        </div>
    );

}