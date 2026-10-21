import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserRole } from "@/app/actions/authActions";
import { pickText, asLocalizedField, type Localized } from "@/lib/types";
import { localePath, routeLang } from "@/lib/i18n-routing";
import EditKitchenForm from "@/components/dashboard/EditKitchenForm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "@/components/LocaleLink";

function toPartial(value: unknown): Partial<Localized> | null {
    const field = asLocalizedField(value);
    return field && typeof field === "object" ? field : null;
}

// Reads the session cookie, so it is always rendered per request.
export const dynamic = "force-dynamic";

export default async function EditKitchenPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    // 1. تشغيل الطلبات بالتوازي (Parallel) لتقليل وقت الانتظار
    const [role, resolvedParams, lang] = await Promise.all([
        getCurrentUserRole(),
        params,
        routeLang(params)
    ]);

    const { id } = resolvedParams;

    // 2. التحقق من الصلاحيات فوراً
    if (role !== "ADMIN" && role !== "ORG") {
        redirect(localePath(lang, "/dashboard"));
    }

    // 3. جلب بيانات المطبخ
    const kitchen = await prisma.kitchen.findUnique({
        where: { id: Number(id) },
    });

    if (!kitchen) notFound();

    const isAr = lang === "ar";

    return (
        <div className="p-8 max-w-3xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
            <Link 
                href="/dashboard/organization" 
                className="flex items-center gap-2 text-ink-mute hover:text-black transition-colors mb-6 font-bold group"
            >
                {isAr ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                {isAr ? "العودة للمطابخ" : "Back to Kitchens"}
            </Link>

            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900">
                    {isAr ? "تعديل بيانات المطبخ" : "Edit Kitchen Details"}
                </h1>
                <p className="text-ink-mute mt-2">
                    {isAr 
                        ? `أنت تقوم الآن بتعديل بيانات: ${pickText(asLocalizedField(kitchen.name), "ar")}` 
                        : `You are currently editing: ${pickText(asLocalizedField(kitchen.name), "en")}`}
                </p>
            </header>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <EditKitchenForm
                    kitchen={{
                        id: kitchen.id,
                        name: toPartial(kitchen.name),
                        region: toPartial(kitchen.region),
                        todaysMeal: toPartial(kitchen.todaysMeal),
                        distributionTime: toPartial(kitchen.distributionTime),
                        contact: kitchen.contact,
                        image: kitchen.image,
                        capacity: kitchen.capacity,
                    }}
                    lang={lang}
                />
            </div>
        </div>
    );
}