import { cookies, headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server"; 
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReportForm from "@/components/ReportForm"; // استيراد المكون الذي أنشأناه

export const metadata = {
  title: "Report Area | NutriFlow",
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-bold">Supabase Configuration Error</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  // 3. حماية الصفحة: إذا لم يسجل الدخول، يظهر زر العودة للدخول
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-sm">
          <p className="text-xl font-bold mb-6 text-gray-800">
            {isAr ? "يجب تسجيل الدخول أولاً لتقديم بلاغ" : "Please login first to submit a report"}
          </p>
          <Link href="/login" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold inline-block hover:bg-emerald-700 transition-all">
            {isAr ? "تسجيل الدخول" : "Login"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6" 
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl max-w-xl w-full border border-gray-50 relative">
        
        {/* زر العودة للصفحة الرئيسية */}
        <Link 
          href="/" 
          className={`absolute top-8 ${isAr ? 'left-8' : 'right-8'} p-2 text-gray-400 hover:text-gray-900 transition-colors`}
        >
          {isAr ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
        </Link>

        <header className="mb-10 mt-4">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
            {isAr ? "بلاغ منطقة محرومة" : "Report Underserved Area"}
          </h1>
          <p className="text-gray-500 text-lg">
            {isAr 
              ? "ساعدنا في تحديد الأماكن التي تحتاج لتدخل سريع." 
              : "Help us identify areas that need urgent intervention."}
          </p>
        </header>
        
        {/* استدعاء مكون الفورم (Client Component) وتمرير البيانات */}
        <ReportForm userId={user.id} isAr={isAr} />
        
      </div>
    </main>
  );
}