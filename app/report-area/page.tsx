import { cookies, headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server"; 
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReportForm from "@/components/ReportForm"; // استيراد المكون الذي أنشأناه

export const metadata = {
  title: "Report Area",
  description: "Submit a community report on underserved Gaza areas that need urgent food security assistance.",
};

export default async function ReportAreaPage() {
  // 1. جلب اللغة من الإعدادات (الكوكيز أو الهيدرز)
  const cookieStore = await cookies();
  const allHeaders = await headers();
  const lang = cookieStore.get("lang")?.value || allHeaders.get("x-custom-lang") || "ar";
  const isAr = lang === "ar";

  // 2. جلب الكلاينت والمستخدم من سوبابيز (Server Side)
  const supabase = await createSupabaseServerClient();
  
  if (!supabase) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-brick-700 font-medium">{isAr ? "تعذّر الاتصال بالخدمة حالياً." : "The service is not available right now."}</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  // 3. حماية الصفحة: إذا لم يسجل الدخول، يظهر زر العودة للدخول
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center" dir={isAr ? "rtl" : "ltr"}>
        <div className="surface p-8 max-w-sm">
          <p className="text-xl font-medium mb-5 text-ink">
            {isAr ? "سجّل دخولك أولاً لتقدّم بلاغاً." : "Sign in first to send a report."}
          </p>
          <Link href="/login" className="btn btn-primary">
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main
      className="max-w-2xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20"
      dir={isAr ? "rtl" : "ltr"}
    >
      <Link
        href="/"
        aria-label={isAr ? "العودة إلى الصفحة الرئيسية" : "Back to the home page"}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-olive-800"
      >
        {isAr ? <ArrowRight size={16} strokeWidth={1.75} /> : <ArrowLeft size={16} strokeWidth={1.75} />}
        {isAr ? "الرئيسية" : "Home"}
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="text-3xl md:text-4xl font-medium text-ink leading-tight">
          {isAr ? "بلّغ عن منطقة محرومة" : "Report an underserved area"}
        </h1>
        <p className="mt-3 text-lg text-ink-soft leading-relaxed">
          {isAr
            ? "إذا كان في حيّك أو مخيّمك من لا يصلهم طعام، أخبرنا. تقرأ فرقنا كل بلاغ."
            : "If people in your neighbourhood or camp are not getting food, tell us. Our teams read every report."}
        </p>
      </header>

      <div className="surface p-6 md:p-8">
        {/* استدعاء مكون الفورم (Client Component) وتمرير البيانات */}
        <ReportForm userId={user.id} isAr={isAr} />
      </div>
    </main>
  );
}
