"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const { lang } = useLanguage() as { lang: "en" | "ar" };
  const isRtl = lang === "ar";
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: { en: "Create your account", ar: "إنشاء حساب جديد" },
    subtitle: { en: "It takes a minute. Then you can track meals, save recipes and reserve a place at a kitchen.", ar: "دقيقة واحدة تكفي. بعدها تتابع وجباتك، وتحفظ الوصفات، وتحجز مكاناً في المطبخ." },
    labelName: { en: "Full Name", ar: "الاسم الكامل" },
    labelEmail: { en: "Email Address", ar: "البريد الإلكتروني" },
    labelPassword: { en: "Password", ar: "كلمة المرور" },
    placeholderName: { en: "Your name", ar: "اسمك الكامل" },
    btnSignup: { en: "Create Account", ar: "إنشاء حساب" },
    btnLoading: { en: "Creating account...", ar: "جاري إنشاء الحساب..." },
    hasAccount: { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
    loginLink: { en: "Sign in", ar: "سجّل دخولك" },
    passHint: { en: "At least 8 characters, with a number and an uppercase letter.", ar: "8 أحرف على الأقل، وتتضمن رقماً وحرفاً كبيراً." },
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
    } catch {
      setGeneralError(t.errGeneric[lang]);
      setIsLoading(false);
    }
  };

  const inputClass = (name: string) => `field ${fieldErrors[name] ? "has-error" : ""}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start md:items-center justify-center px-5 py-12 md:py-16" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="surface p-7 md:p-9">
          <LogoMark size={36} />
          <h1 className="mt-5 text-2xl md:text-3xl font-medium text-ink">{t.title[lang]}</h1>
          <p className="mt-1.5 text-ink-soft">{t.subtitle[lang]}</p>

          {generalError && (
            <div role="alert" className="mt-6 px-3.5 py-3 rounded-md bg-brick-50 border border-brick-200 flex gap-3 items-start animate-shake">
              <AlertCircle className="text-brick-700 flex-shrink-0 mt-0.5" size={18} strokeWidth={1.75} />
              <p className="text-sm text-brick-800">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* الحقل: الاسم */}
            <div>
              <label htmlFor="signup-name" className="label">{t.labelName[lang]}</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                className={inputClass("name")}
                aria-invalid={fieldErrors.name ? true : undefined}
                placeholder={t.placeholderName[lang]}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {fieldErrors.name && <p className="mt-1.5 text-sm text-brick-700">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="signup-email" className="label">{t.labelEmail[lang]}</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                className={inputClass("email")}
                aria-invalid={fieldErrors.email ? true : undefined}
                placeholder="name@example.com"
                dir="ltr"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {fieldErrors.email && <p className="mt-1.5 text-sm text-brick-700">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="label">{t.labelPassword[lang]}</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                className={inputClass("password")}
                aria-invalid={fieldErrors.password ? true : undefined}
                placeholder="••••••••"
                dir="ltr"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {fieldErrors.password && <p className="mt-1.5 text-sm text-brick-700">{fieldErrors.password}</p>}
              {!fieldErrors.password && (
                <p className="mt-1.5 text-sm text-ink-mute">{t.passHint[lang]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full !py-3"
            >
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {isLoading ? t.btnLoading[lang] : t.btnSignup[lang]}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            {t.hasAccount[lang]} <Link href="/login" className="text-link">{t.loginLink[lang]}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
