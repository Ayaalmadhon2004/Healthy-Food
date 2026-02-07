"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, UserPlus, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: { en: "Join NutriFlow", ar: "انضم إلى نيوتروفلو" },
    subtitle: { en: "Start your healthy journey today", ar: "ابدأ رحلتك الصحية اليوم" },
    labelName: { en: "Full Name", ar: "الاسم الكامل" },
    labelEmail: { en: "Email Address", ar: "البريد الإلكتروني" },
    labelPassword: { en: "Password", ar: "كلمة المرور" },
    placeholderName: { en: "John Doe", ar: "أدخل اسمك الكامل" },
    btnSignup: { en: "Create Account", ar: "إنشاء حساب" },
    btnLoading: { en: "Processing...", ar: "جاري المعالجة..." },
    hasAccount: { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
    loginLink: { en: "Login here", ar: "سجل دخولك هنا" },
    passHint: { en: "Min. 8 characters with numbers & uppercase", ar: "8 أحرف على الأقل مع أرقام وحروف كبيرة" },
    errGeneric: { en: "Something went wrong. Please try again.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى." }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        } else {
          setGeneralError(data.error || t.errGeneric[lang]);
        }
        setIsLoading(false);
        return;
      }

      router.push("/login?message=registered");
    } catch (err) {
      setGeneralError(t.errGeneric[lang]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-12" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-green-100">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <UserPlus className="text-green-600" size={30} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.title[lang]}</h1>
            <p className="text-gray-500 font-medium">{t.subtitle[lang]}</p>
          </div>

          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 items-center animate-shake">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700 font-bold">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* الحقل: الاسم */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">{t.labelName[lang]}</label>
              <input 
                type="text" 
                className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${
                  fieldErrors.name ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 bg-gray-50/50"
                }`}
                placeholder={t.placeholderName[lang]}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600 font-bold px-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">{t.labelEmail[lang]}</label>
              <input 
                type="email" 
                className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${
                  fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 bg-gray-50/50"
                }`}
                placeholder="name@example.com"
                dir="ltr"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600 font-bold px-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">{t.labelPassword[lang]}</label>
              <input 
                type="password" 
                className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${
                  fieldErrors.password ? "border-red-500 bg-red-50" : "border-gray-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 bg-gray-50/50"
                }`}
                placeholder="••••••••"
                dir="ltr"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600 font-bold px-1">{fieldErrors.password}</p>}
              {!fieldErrors.password && (
                <p className="mt-2 text-[11px] text-gray-400 px-1 flex items-center gap-1">
                  <ShieldCheck size={12} /> {t.passHint[lang]}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-200 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              {isLoading ? t.btnLoading[lang] : t.btnSignup[lang]}
            </button>
          </form>

          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600 font-medium">
              {t.hasAccount[lang]} <Link href="/login" className="text-green-600 font-bold hover:underline">{t.loginLink[lang]}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
