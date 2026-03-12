"use client";

import { useState, useEffect } from "react";
import { reserveMealAction } from "@/app/actions/mealActions";
import { useUserData } from "@/hooks/useUserData";

export default function MealRegistration({ kitchenId, initialCount = 0, capacity = 500, lang = "ar" }) {
    const { user } = useUserData();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); 
    const [message, setMessage] = useState("");
    const [currentCount, setCurrentCount] = useState(Number(initialCount) || 0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setCurrentCount(Number(initialCount) || 0);
    }, [initialCount]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage("");
                setStatus(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    },[message]);

    const translations = {
    ar: { title: "📅 وجبة غداً", remaining: "متبقي", success: "تم بنجاح", reserveBtn: "احجز الآن", familySize: "الأفراد" },
    en: { title: "📅 Tomorrow", remaining: "Left", success: "Success", reserveBtn: "Reserve", familySize: "Family" }
    };

    const t = translations[lang] || translations.ar;
    const isAr = lang === "ar";

    const limit = Math.max(Number(capacity) || 500, 1); 
    const percentage = Math.min((currentCount / limit) * 100, 100);
    const remaining = Math.max(limit - currentCount, 0);

    const handleReserve = async () => {
        if (!user) return alert(t.loginAlert);
        
        setLoading(true);
        setMessage("");

        try {
            const result = await reserveMealAction(user.id, kitchenId, quantity);
            
            if (result?.error) {
                setMessage(result.error);
            } else if (result?.success) {
                setMessage(t.success);
                setCurrentCount(prev => prev + quantity);
            }
        } catch (err) {
            setMessage(t.errorDefault);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className={`bg-white p-6 rounded-3xl shadow-xl border border-green-100 flex flex-col gap-4 max-w-md w-full transition-all duration-300 ${isAr ? 'rtl font-sans' : 'ltr font-sans'}`} 
            dir={isAr ? 'rtl' : 'ltr'}
        >
            {/* الترويسة والعداد */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                        {t.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {t.subtitle}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border transition-colors ${
                        remaining === 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                    {t.remaining} {remaining} {t.meal}
                    </span>
                </div>
            </div>

            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-50 p-[2px]">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-in-out ${
                        percentage > 90 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    }`} 
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-sm font-bold text-gray-700">{t.familySize}</span>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl font-bold hover:bg-gray-100 active:scale-90 transition-all"
                    >
                        -
                    </button>
                    <span className="text-xl font-black text-emerald-600 min-w-[20px] text-center">
                        {quantity}
                    </span>
                    <button 
                        onClick={() => setQuantity(prev => Math.min(10, prev + 1))} 
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl font-bold hover:bg-gray-100 active:scale-90 transition-all"
                    >
                        +
                    </button>
                </div>
            </div>

            <p className="text-gray-500 text-[13px] leading-relaxed italic">
                {t.description}
            </p>

            {message && (
                <div className={`p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${
                    message.includes("نجاح") || message.toLowerCase().includes("success")
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                    {message}
                </div>
            )}

            {/* زر الحجز الرئيسي */}
            <button
                onClick={handleReserve}
                disabled={loading || currentCount >= limit}
                className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-3 ${
                    currentCount >= limit 
                    ? "bg-gray-200 cursor-not-allowed text-gray-400" 
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                }`}
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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