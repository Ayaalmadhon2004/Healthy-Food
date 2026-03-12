"use client";

import { useState, useEffect, useMemo } from "react";
import { reserveMealAction , cancelMealAction } from "@/app/actions/mealActions";
import { useUserData } from "@/hooks/useUserData";

export default function MealRegistration({ kitchenId, initialCount = 0, capacity = 500, lang = "ar" }) {
    const { user } = useUserData();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [message, setMessage] = useState("");
    const [currentCount, setCurrentCount] = useState(Number(initialCount) || 0);
    const [quantity, setQuantity] = useState(1);
    const [isReserved, setIsReserved] = useState(false);
    
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
    }, [message]);

    const t = useMemo(() => {
        const translations = {
            ar: {
                title: "📅 وجبة غداً",
                subtitle: "نظام الحجز المسبق",
                remaining: "متبقي",
                meal: "وجبة",
                familySize: "عدد أفراد الأسرة:",
                description: "يساعدنا الحجز المسبق على توزيع الوجبات بعدالة وضمان عدم إهدار أي طعام.",
                reserveBtn: "احجز الوجبات لغدًا",
                loading: "جاري الحجز...",
                full: "عذراً، اكتمل العدد",
                loginAlert: "يرجى تسجيل الدخول أولاً",
                errorDefault: "حدث خطأ غير متوقع",
                success: "تم حجز الوجبات بنجاح"
            },
            en: {
                title: "📅 Tomorrow's Meal",
                subtitle: "Pre-order System",
                remaining: "Remaining",
                meal: "meals",
                familySize: "Family members:",
                description: "Pre-ordering helps us distribute meals fairly and ensure no food is wasted.",
                reserveBtn: "Reserve meals for tomorrow",
                loading: "Reserving...",
                full: "Sorry, fully booked",
                loginAlert: "Please login first",
                errorDefault: "An unexpected error occurred",
                success: "Reservation successful"
            }
        };
        return translations[lang] || translations.ar;
    }, [lang]);

    const isAr = lang === "ar";
    const limit = Math.max(Number(capacity) || 500, 1);
    const remaining = Math.max(limit - currentCount, 0);
    const percentage = Math.min((currentCount / limit) * 100, 100);

    const handleReserve = async () => {
        if (!user) return alert(t.loginAlert);
        if (currentCount >= limit) return;

        setLoading(true);
        setMessage("");
        setStatus(null);

        try {
            const result = await reserveMealAction(user.id, kitchenId, quantity);
            
            if (result?.success) {
                setStatus("success");
                setMessage(result.success || t.success);
                setCurrentCount(prev => prev + quantity);
            } else {
                setStatus("error");
                setMessage(result?.error || t.errorDefault);
            }
        } catch (err) {
            setStatus("error");
            setMessage(t.errorDefault);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async()=>{
        if (!user) return alert(t.loginAlert);
        setLoading(true);

        try{
            const result = await cancelMealAction(user.id,kitchenId);
            if(result?.success){
                setMessage(isAr ? "تم إلغاء الحجز بنجاح" : "Reservation cancelled");
                setCurrentCount(prev =>Math.max(0,prev-quantity));
            }
        } catch(err){
            setMessage(t.errorDefault);
        } finally{
            setLoading(false);
        }


    }

    return (
        <div 
            className={`bg-white p-6 rounded-3xl shadow-xl border border-green-100 flex flex-col gap-4 max-w-md w-full transition-all duration-300 ${isAr ? 'rtl' : 'ltr'}`} 
            dir={isAr ? 'rtl' : 'ltr'}
        >
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

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-50 p-[2px]">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        percentage > 90 ? 'bg-rose-500' : 'bg-emerald-500'
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
                        onClick={() => setQuantity(prev => Math.min(10, prev + 1))} // حد أقصى 10 أفراد
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
                <div className={`p-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${
                    status === "success" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                    {message}
                </div>
            )}

            <button
                onClick={handleReserve}
                disabled={loading || currentCount >= limit}
                className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-3 ${
                    currentCount >= limit 
                    ? "bg-gray-200 cursor-not-allowed text-gray-400" 
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : currentCount >= limit ? (
                    t.full
                ) : (
                    `${t.reserveBtn} (${quantity})`
                )}
            </button>
        </div>
    );
}