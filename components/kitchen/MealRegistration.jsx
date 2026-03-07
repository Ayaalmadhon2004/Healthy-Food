"use client";

import { useState } from "react";
import { reserveMealAction } from "@/app/actions/mealActions";
import { useUserData } from "@/hooks/useUserData";

export default function MealRegistration({ kitchenId, initialCount = 0, capacity = 500, lang = "ar" }) {
    const { user } = useUserData();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [currentCount, setCurrentCount] = useState(initialCount);

    // نصوص الترجمة
    const translations = {
        ar: {
        title: "📅 وجبة غداً",
        subtitle: "نظام الحجز المسبق",
        remaining: "متبقي",
        meal: "وجبة",
        description: "يساعدنا الحجز المسبق على توزيع الوجبات بعدالة وضمان عدم إهدار أي طعام.",
        reserveBtn: "احجز وجبتي لغدًا",
        loading: "جاري الحجز...",
        full: "عذراً، اكتمل العدد",
        loginAlert: "يرجى تسجيل الدخول أولاً",
        errorDefault: "حدث خطأ غير متوقع"
        },
        en: {
        title: "📅 Tomorrow's Meal",
        subtitle: "Pre-order System",
        remaining: "Remaining",
        meal: "meals",
        description: "Pre-ordering helps us distribute meals fairly and ensure no food is wasted.",
        reserveBtn: "Reserve my meal for tomorrow",
        loading: "Reserving...",
        full: "Sorry, fully booked",
        loginAlert: "Please login first",
        errorDefault: "An unexpected error occurred"
        }
    };

    const t = translations[lang] || translations.ar;
    const isAr = lang === "ar";

    const limit = Number(capacity);
    const percentage = Math.min((currentCount / limit) * 100, 100);

    const handleReserve = async () => {
        if (!user) return alert(t.loginAlert);
        
        setLoading(true);
        setMessage("");

        try {
        const result = await reserveMealAction(user.id, kitchenId);
        
        if (result.error) {
            setMessage(result.error);
        } else {
            setMessage(result.success);
            setCurrentCount(prev => prev + 1);
        }
        } catch (err) {
        setMessage(t.errorDefault);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className={`bg-white p-6 rounded-3xl shadow-xl border border-green-100 flex flex-col gap-4 max-w-md w-full ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-center">
            <div className="flex flex-col">
            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                {t.title}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t.subtitle}
            </span>
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {t.remaining} {Math.max(limit - currentCount, 0)} {t.meal}
            </span>
        </div>

        <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden border border-gray-50">
            <div 
            className={`h-full transition-all duration-700 ease-out ${percentage > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
            style={{ width: `${percentage}%` }}
            />
        </div>

        <p className="text-gray-500 text-sm leading-relaxed">
            {t.description}
        </p>

        {message && (
            <div className={`p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1 ${
            message.includes("نجاح") || message.includes("success")
                ? "bg-green-50 text-green-700 border border-green-100" 
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
            {message}
            </div>
        )}

        <button
            onClick={handleReserve}
            disabled={loading || currentCount >= limit}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
        >
            {loading ? (
            <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.loading}
            </>
            ) : currentCount >= limit ? (
            t.full
            ) : (
            t.reserveBtn
            )}
        </button>
        </div>
    );
}