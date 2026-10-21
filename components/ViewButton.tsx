"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function ViewButton({ id }: { id: number | string }) {
  const router = useRouter();
  const { lang } = useLanguage();

  return (
    <button
      onClick={() => router.push(`/recipes/${id}`)}
      className="btn btn-primary w-full !py-2"
    >
      {lang === "ar" ? "عرض الوصفة" : "View recipe"}
    </button>
  );
}
