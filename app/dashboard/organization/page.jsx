"use client";

import { useEffect, useState, use } from "react"; 
import { getKitchensAction } from "@/app/actions/kitchenActions";
import OrgKitchenTable from "@/components/dashboard/OrgKitchenTable";
import AddKitchenModal from "@/components/dashboard/AddKitchenModal";
// ✅ استيراد الـ Hook الخاص باللغة (تأكدي من المسار الصحيح في مشروعك)
import { useLanguage } from "@/context/LanguageContext"; 

export default function OrganizationPage({ searchParams }) {
  // 1. فك بارامترات الصفحة (فقط لرقم الصفحة)
  const params = use(searchParams);
  const currentPage = Number(params?.page) || 1;
  
  // ✅ 2. قراءة اللغة من الـ Context بدلاً من الرابط
  const { lang } = useLanguage(); 

  const [data, setData] = useState({ kitchens: [], totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    const result = await getKitchensAction(currentPage, 5);
    if (result.success) {
      setData({ 
        kitchens: result.kitchens || [], 
        totalPages: result.totalPages || 1 
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [currentPage]);

  const t = {
    ar: { title: "إدارة المطابخ", desc: "إدارة وتعديل وحذف المطابخ التابعة لمؤسستك." },
    en: { title: "Kitchen Management", desc: "Manage, edit, and delete your kitchens." }
  };
  
  const currentT = t[lang] || t.ar;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{currentT.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{currentT.desc}</p>
        </div>

        <AddKitchenModal 
          lang={lang} 
          kitchens={data.kitchens} 
          onSuccess={refreshData} 
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400 animate-pulse">
             {lang === "ar" ? "جاري التحميل..." : "Loading..."}
          </div>
        ) : (
          <OrgKitchenTable 
            initialKitchens={data.kitchens} 
            totalPages={data.totalPages}
            currentPage={currentPage}
            lang={lang} 
          />
        )}
      </div>
    </div>
  );
}