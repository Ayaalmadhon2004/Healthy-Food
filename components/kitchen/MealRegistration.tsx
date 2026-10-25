"use client";

import { useState, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { reserveMealAction , cancelMealAction , checkUserReservation } from "@/app/actions/mealActions";
import { useUserData } from "@/hooks/useUserData";

interface MealRegistrationProps {
    kitchenId: number | string;
    initialCount?: number;
    capacity?: number;
    lang?: string;
}

export default function MealRegistration({ kitchenId, initialCount = 0, capacity = 500, lang = "ar" }: MealRegistrationProps) {
    const { user } = useUserData();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | null>(null);
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

    useEffect(() => {
    const verifyReservation = async () => {
        if (user?.id) {
            const reserved = await checkUserReservation(user.id, kitchenId);
            setIsReserved(reserved);
        }
    };
    verifyReservation();
    }, [user, kitchenId]);

    const t = useMemo(() => {
        const translations = {
            ar: {
                title: "وجبة الغد",
                subtitle: "احجز مسبقاً",
                remaining: "متبقي",
                meal: "وجبة",
                familySize: "عدد أفراد الأسرة:",
                description: "الحجز المسبق يساعد المطبخ على توزيع الوجبات بعدل، ولا يضيع منها شيء.",
                reserveBtn: "احجز الوجبات لغدًا",
                loading: "جاري الحجز...",
                full: "عذراً، اكتمل العدد",
                loginAlert: "يرجى تسجيل الدخول أولاً",
                errorDefault: "حدث خطأ غير متوقع",
                success: "تم حجز الوجبات بنجاح",
                errors: {
                    LOGIN_REQUIRED: "يرجى تسجيل الدخول أولاً.",
                    INVALID_QUANTITY: "يجب اختيار وجبة واحدة على الأقل.",
                    KITCHEN_NOT_FOUND: "المطبخ غير موجود.",
                    ALREADY_RESERVED: "لقد قمت بالحجز مسبقاً لهذا المطبخ لغدًا.",
                    NOT_ENOUGH_LEFT: (n: number) => `عذراً، المتبقي فقط ${n} وجبة.`,
                    BUSY: "الطلبات كثيرة حالياً، حاول مرة أخرى."
                }
            },
            en: {
                title: "Tomorrow's meal",
                subtitle: "Reserve ahead",
                remaining: "Remaining",
                meal: "meals",
                familySize: "Family members:",
                description: "Reserving ahead lets the kitchen share meals fairly, and nothing goes to waste.",
                reserveBtn: "Reserve meals for tomorrow",
                loading: "Reserving...",
                full: "Sorry, fully booked",
                loginAlert: "Please login first",
                errorDefault: "An unexpected error occurred",
                success: "Reservation successful",
                errors: {
                    LOGIN_REQUIRED: "Please log in first.",
                    INVALID_QUANTITY: "Please choose at least one meal.",
                    KITCHEN_NOT_FOUND: "Kitchen not found.",
                    ALREADY_RESERVED: "You have already reserved at this kitchen for tomorrow.",
                    NOT_ENOUGH_LEFT: (n: number) => `Sorry, only ${n} meals left.`,
                    BUSY: "Many requests right now, please try again."
                }
            }
        };
        return translations[lang as keyof typeof translations] || translations.ar;
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
            
            if ("success" in result) {
                setIsReserved(true); 
                setStatus("success");
                setStatus("success");
                setMessage(t.success);
                setCurrentCount(prev => prev + quantity);
            } else {
                setStatus("error");
                const known: string | ((remaining: number) => string) | undefined =
                    (t.errors as Record<string, string | ((remaining: number) => string)>)[result.error];
                setMessage(typeof known === "function" ? known(result.remaining ?? 0) : known || t.errorDefault);
            }
        } catch {
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
                setIsReserved(false); 
                setStatus("success");
                setMessage(isAr ? "تم إلغاء الحجز بنجاح" : "Reservation cancelled");
                setCurrentCount(prev => Math.max(0, prev - (result.quantity || 0)));
            }
        } catch {
            setMessage(t.errorDefault);
        } finally{
            setLoading(false);
        }
    }

    return (
        <div
            className="flex flex-col gap-4 w-full"
            dir={isAr ? 'rtl' : 'ltr'}
        >
            <div className="flex justify-between items-baseline gap-3">
                <div className="flex flex-col">
                    <h3 className="font-semibold text-lg text-ink">
                        {t.title}
                    </h3>
                    <span className="text-xs text-ink-mute">
                        {t.subtitle}
                    </span>
                </div>
                <span className={`text-sm font-medium ${remaining === 0 ? 'text-brick-700' : 'text-olive-800'}`}>
                    {t.remaining} {remaining} {t.meal}
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="w-full bg-paper-deep h-2 rounded-sm overflow-hidden"
                role="progressbar"
                aria-label={`${t.title}: ${t.remaining} ${remaining} ${t.meal}`}
                aria-valuemin={0}
                aria-valuemax={limit}
                aria-valuenow={Math.min(currentCount, limit)}
            >
                <div
                    className={`h-full transition-[width] duration-500 ease-out ${
                        percentage > 90 ? 'bg-brick-600' : 'bg-olive-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex items-center justify-between py-3 border-y border-line">
                <span className="text-sm font-medium text-ink">{t.familySize}</span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        aria-label={isAr ? "أقل" : "Fewer"}
                        className="w-9 h-9 rounded-md bg-white border border-line-strong flex items-center justify-center text-lg hover:bg-paper-deep transition-colors"
                    >
                        -
                    </button>
                    <span className="text-lg font-semibold text-ink min-w-[1.5rem] text-center tabular-nums">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity(prev => Math.min(10, prev + 1))} // حد أقصى 10 أفراد
                        aria-label={isAr ? "أكثر" : "More"}
                        className="w-9 h-9 rounded-md bg-white border border-line-strong flex items-center justify-center text-lg hover:bg-paper-deep transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            <p className="text-ink-mute text-[0.8125rem] leading-relaxed">
                {t.description}
            </p>

            {message && (
                <div role="status" className={`settle flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium border ${
                    status === "success"
                        ? "bg-olive-50 text-olive-900 border-olive-200"
                        : "bg-brick-50 text-brick-800 border-brick-200"
                }`}>
                    {status === "success" && <Check size={16} strokeWidth={2.25} className="tick-in shrink-0" aria-hidden="true" />}
                    {message}
                </div>
            )}

            {isReserved ? (
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="btn btn-quiet w-full !text-brick-700 !border-brick-300"
                >
                    {loading ? "..." : (isAr ? "إلغاء الحجز" : "Cancel reservation")}
                </button>
                ) : (
                <button
                    onClick={handleReserve}
                    disabled={loading}
                    className="btn btn-primary w-full"
                >
                    {loading ? "..." : (isAr ? "احجز الآن" : "Reserve now")}
                </button>
                )}
                </div>
            );
}
