"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { LogoMark } from "@/components/Logo"
import { useUserData } from "@/hooks/useUserData" // تأكد من المسار الصحيح
import { useFavStore } from "@/store/useFavStore" // تأكد من المسار الصحيح

interface AuthText {
    login_title: string
    login_subtitle: string
    email_label: string
    email_placeholder: string
    password_label: string
    password_placeholder: string
    signing_in: string
    login_button: string
    no_account: string
    create_account: string
    errors: Record<string, string>
}

export default function LoginClient({ t }: { t: AuthText }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // استدعاء دوال التحديث من الستورز
    const { setUser } = useUserData()
    const setFavItems = useFavStore((state) => state.setFavItems)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                // استخدام رسالة الخطأ القادمة من السيرفر أو القاموس
                setError(t.errors[data.error] || data.error || t.errors.general_error)
                setIsLoading(false)
                return
            }

            // 1. تحديث بيانات المستخدم في الستور فوراً
            if (data.user) {
                setUser(data.user)
            }

            // 2. تحديث المفضلات فوراً لكي تظهر في الـ Navbar
            if (data.favorites) {
                setFavItems(data.favorites)
            }

            // 3. التوجه للـ Dashboard أو الصفحة الرئيسية
            router.push("/") 
            router.refresh()
            
        } catch (err) {
            console.error("Login Client Error:", err)
            setError(t.errors.general_error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-start md:items-center justify-center px-5 py-12 md:py-16">
            <div className="w-full max-w-md">
                <div className="surface p-7 md:p-9">
                    <LogoMark size={36} />
                    <h1 className="mt-5 text-2xl md:text-3xl font-medium text-ink">{t.login_title}</h1>
                    <p className="mt-1.5 text-ink-soft">{t.login_subtitle}</p>

                    {error && (
                        <div role="alert" className="mt-6 px-3.5 py-3 rounded-md bg-brick-50 border border-brick-200 flex gap-3 items-start">
                            <AlertCircle className="text-brick-700 flex-shrink-0 mt-0.5" size={18} strokeWidth={1.75} />
                            <p className="text-sm text-brick-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                        <div>
                            <label htmlFor="email" className="label">
                                {t.email_label}
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="field"
                                placeholder={t.email_placeholder}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                {t.password_label}
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="field"
                                placeholder={t.password_placeholder}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full !py-3"
                        >
                            {isLoading ? t.signing_in : t.login_button}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-ink-soft">
                        {t.no_account}{" "}
                        <Link href="/signup" className="text-link">
                            {t.create_account}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
