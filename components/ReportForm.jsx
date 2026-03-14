"use client";

import { submitAreaReportAction } from "@/app/actions/reportActions";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // الخطوة الأهم

export default function ReportForm({ userId, isAr }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  async function handleSubmit(e) {
    e.preventDefault(); 
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await submitAreaReportAction(formData);
      router.push("/dashboard/tracker?success=true");
      router.refresh();
    } catch (error) {
      console.error("Submission failed:", error);
      alert(isAr ? "فشل الإرسال، يرجى المحاولة لاحقاً" : "Submission failed, try again");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="userId" value={userId} />
      
      <div className="flex flex-col gap-2">
        <label className="font-black text-gray-700">
          {isAr ? "اسم المنطقة أو الحي" : "Area Name"}
        </label>
        <input 
          name="areaName" 
          required 
          className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] outline-none focus:border-emerald-500 transition-all shadow-sm" 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-black text-gray-700">
          {isAr ? "وصف حالة الاحتياج" : "Description"}
        </label>
        <textarea 
          name="description" 
          required 
          className="p-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] h-44 outline-none focus:border-emerald-500 transition-all resize-none shadow-sm" 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="bg-gray-900 text-white p-6 rounded-[1.5rem] font-black text-xl hover:bg-black transition-all shadow-lg active:scale-95 mt-2 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            <span>{isAr ? "جاري الإرسال..." : "Sending..."}</span>
          </>
        ) : (
          <span>{isAr ? "إرسال البلاغ الآن" : "Submit Report Now"}</span>
        )}
      </button>
    </form>
  );
}