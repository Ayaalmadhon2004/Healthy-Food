"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { useUserStore } from "@/store/useUserStore"

// نمرر t (الترجمة) و lang (اللغة الحالية) من السيرفر
export default function LoginClient({ t, lang }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const store = useUserStore.getState()
        if ("fetchUser" in store && typeof store.fetchUser === "function") {
            await store.fetchUser()
        }

        const data = await res.json()

        if (!res.ok) {
            // جلب رسالة الخطأ المترجمة من الـ JSON بناءً على الكود القادم من الـ API
            setError(t.errors[data.error] || t.errors.general_error)
            setIsLoading(false)
            return
        }

        // بما أننا لا نستخدم [lang] في الرابط، نعود للرئيسية مباشرة
        router.push("/")
        router.refresh()
        } catch (err) {
        setError(t.errors.general_error)
        setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-12">
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.login_title}</h1>
                <p className="text-gray-600">{t.login_subtitle}</p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3 items-start">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email_label}
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder={t.email_placeholder}
                />
                </div>

                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.password_label}
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder={t.password_placeholder}
                />
                </div>

                <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                {isLoading ? t.signing_in : t.login_button}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                {t.no_account}{" "}
                <Link href="/signup" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
                    {t.create_account}
                </Link>
                </p>
            </div>
            </div>
        </div>
        </div>
    )
}