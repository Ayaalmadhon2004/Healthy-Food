import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserRole } from "@/app/actions/authActions";
import EditKitchenForm from "@/components/dashboard/EditKitchenForm";
import { cookies } from "next/headers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function EditKitchenPage({ params }) {
    const role = await getCurrentUserRole();
    if (role !== "ADMIN" && role !== "ORG") {
        redirect("/dashboard");
    }
    const { id } = await params;

    const cookieStore = await cookies();
    const lang = cookieStore.get("lang")?.value || "ar";

    const kitchen = await prisma.kitchen.findUnique({
        where: { id :Number(id)},
    });

    if (!kitchen) notFound();

    const isAr = lang === "ar";

return (
        <div className="p-8 max-w-3xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
        <Link 
            href="/organization" 
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 font-bold group"
        >
            {isAr ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {isAr ? "العودة للمطابخ" : "Back to Kitchens"}
        </Link>

        <header className="mb-10">
            <h1 className="text-4xl font-black text-gray-900">
            {isAr ? "تعديل بيانات المطبخ" : "Edit Kitchen Details"}
            </h1>
            <p className="text-gray-500 mt-2">
            {isAr 
                ? `أنت تقوم الآن بتعديل بيانات: ${kitchen.name.ar}` 
                : `You are currently editing: ${kitchen.name.en}`}
            </p>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
            <EditKitchenForm kitchen={kitchen} lang={lang} />
        </div>
        </div>
    );
}