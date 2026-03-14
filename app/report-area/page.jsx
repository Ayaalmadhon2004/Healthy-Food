import { cookies, headers } from "next/headers";
// استدعاء الدالة الصحيحة من ملف السيرفر الخاص بكِ
import { createSupabaseServerClient } from "@/lib/supabase/server"; 
import { submitAreaReportAction } from "@/app/actions/reportActions";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ReportAreaPage() {
  // 1. جلب اللغة
  const cookieStore = await cookies();
  const allHeaders = await headers();
  const lang = cookieStore.get("lang")?.value || allHeaders.get("x-custom-lang") || "ar";
  const isAr = lang === "ar";

  // 2. جلب الكلاينت والمستخدم باستخدام الدالة الخاصة بكِ
  const supabase = await createSupabaseServerClient();
  
  // حماية في حال فشل الاتصال بسوبابيز
  if (!supabase) return <div>Configuration Error</div>;

  const { data: { user } } = await supabase.auth.getUser();

  // 3. حماية الصفحة (إذا لم يسجل دخول)
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
        
        {/* زر العودة */}
        <Link 
          href="/" 
          className={`absolute top-8 ${isAr ? 'left-8' : 'right-8'} p-2 text-gray-400 hover:text-gray-900 transition-colors`}
        >
          {isAr ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
            {isAr ? "بلاغ منطقة محرومة" : "Report Underserved Area"}
          </h1>
          <p className="text-gray-500 text-lg">
            {isAr ? "أخبرنا عن المناطق التي تعاني من نقص حاد." : "Identify areas with severe shortages."}
          </p>
        </header>
        
        <form action={submitAreaReportAction} className="flex flex-col gap-6">
          <input type="hidden" name="userId" value={user.id} />
          
          <div className="flex flex-col gap-2">
            <label className="font-black text-gray-700 px-1">
              {isAr ? "اسم المنطقة أو الحي" : "Area Name"}
            </label>
            <input 
              name="areaName" 
              required 
              className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-black text-gray-700 px-1">
              {isAr ? "وصف حالة الاحتياج" : "Description"}
            </label>
            <textarea 
              name="description" 
              required 
              className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] h-44 outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none shadow-sm" 
            />
          </div>

          <button 
            type="submit" 
            className="bg-gray-900 text-white p-6 rounded-[1.5rem] font-black text-xl hover:bg-black transition-all shadow-lg active:scale-95 mt-2"
          >
            {isAr ? "إرسال البلاغ الآن" : "Submit Report Now"}
          </button>
        </form>
      </div>
    </main>
  );
}