"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext"; // استيراد السياق

export default function SignupPage() {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // نصوص الترجمة
  const t = {
    title: { en: "NutriFlow Auth", ar: "توثيق نيوتروفلو" },
    subtitle: { en: "Create your account", ar: "إنشاء حساب جديد" },
    labelName: { en: "Full Name", ar: "الاسم الكامل" },
    labelEmail: { en: "Email Address", ar: "البريد الإلكتروني" },
    labelPassword: { en: "Password", ar: "كلمة المرور" },
    placeholderName: { en: "Enter your full name", ar: "أدخل اسمك الكامل" },
    placeholderEmail: { en: "you@example.com", ar: "example@mail.com" },
    passHint: { en: "At least 6 characters", ar: "6 أحرف على الأقل" },
    btnSignup: { en: "Sign Up", ar: "إنشاء الحساب" },
    btnLoading: { en: "Creating Account...", ar: "جاري إنشاء الحساب..." },
    hasAccount: { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
    loginLink: { en: "Login here", ar: "سجل دخولك هنا" },
    terms: { 
      en: "By creating an account, you agree to our Terms of Service and Privacy Policy", 
      ar: "بإنشاء حساب، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا" 
    },
    errPass: { en: "Password must be at least 6 characters", ar: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" },
    errGeneric: { en: "An error occurred. Please try again.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى." },
    errExists: { en: "This email is already registered", ar: "هذا البريد الإلكتروني مسجل بالفعل" }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t.errPass[lang]);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error === "emailExists" ? t.errExists[lang] : data.error || t.errGeneric[lang]);
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(t.errGeneric[lang]);
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-green-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.title[lang]}</h1>
            <p className="text-gray-500 font-medium">{t.subtitle[lang]}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 items-center animate-shake">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                {t.labelName[lang]}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all bg-gray-50/50"
                placeholder={t.placeholderName[lang]}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                {t.labelEmail[lang]}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all bg-gray-50/50"
                placeholder={t.placeholderEmail[lang]}
                dir="ltr" // البريد دائماً يكتب بالإنجليزية
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                {t.labelPassword[lang]}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all bg-gray-50/50"
                placeholder="••••••••"
                dir="ltr" // كلمة المرور يفضل أن تكون LTR دائماً
              />
              <p className="mt-2 text-xs text-gray-500 px-1 font-medium">
                {t.passHint[lang]}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-200 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? t.btnLoading[lang] : t.btnSignup[lang]}
            </button>
          </form>

          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600 font-medium">
              {t.hasAccount[lang]}{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-bold hover:underline transition-colors">
                {t.loginLink[lang]}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center max-w-xs mx-auto">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            {t.terms[lang]}
          </p>
        </div>
      </div>
    </div>
  );
}