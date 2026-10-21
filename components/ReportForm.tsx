"use client";

import { submitAreaReportAction } from "@/app/actions/reportActions";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // الخطوة الأهم

export default function ReportForm({ userId, isAr }: { userId: string; isAr: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label htmlFor="report-area-name" className="label">
          {isAr ? "اسم المنطقة أو الحي" : "Area or neighbourhood"}
        </label>
        <input
          id="report-area-name"
          name="areaName"
          required
          className="field"
        />
      </div>

      <div>
        <label htmlFor="report-description" className="label">
          {isAr ? "ما الذي ينقصهم؟" : "What is missing there?"}
        </label>
        <textarea
          id="report-description"
          name="description"
          required
          className="field h-40 resize-none"
        />
        <p className="mt-1.5 text-sm text-ink-mute">
          {isAr ? "كم عائلة تقريباً؟ ومنذ متى لم يصلهم طعام؟" : "Roughly how many families, and how long since food last arrived?"}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary self-start !px-6 !py-3"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>{isAr ? "جاري الإرسال..." : "Sending..."}</span>
          </>
        ) : (
          <span>{isAr ? "أرسل البلاغ" : "Send report"}</span>
        )}
      </button>
    </form>
  );
}
