import type { Metadata } from "next";
import { routeLang, type LangParams } from "@/lib/i18n-routing";
import { localizedMetadata, NO_INDEX } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server"; 
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "@/components/LocaleLink";
import ReportForm from "@/components/ReportForm"; // استيراد المكون الذي أنشأناه

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(
    await routeLang(params),
    "/report-area",
    {
      ar: { title: "بلّغ عن منطقة محرومة", description: "أرسل بلاغاً عن حي أو مخيّم لا يصله الطعام ليصل إليه فريقنا الميداني." },
      en: { title: "Report an underserved area", description: "Tell us about a neighbourhood or camp that is not getting food so our field teams can reach it." },
    },
    NO_INDEX,
  );
}

// Reads the session cookie, so it is always rendered per request.
export const dynamic = "force-dynamic";

export default async function ReportAreaPage({ params }: LangParams) {
  // 1. اللغة من الرابط، والكلاينت من سوبابيز (Server Side) بالتوازي
  const [lang, supabase] = await Promise.all([routeLang(params), createSupabaseServerClient()]);
  const isAr = lang === "ar";
  
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
    <div
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
    </div>
  );
}
