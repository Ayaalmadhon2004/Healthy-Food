"use client";

import { useEffect, useState, use } from "react"; 
import { getKitchensAction } from "@/app/actions/kitchenActions";
import OrgKitchenTable from "@/components/dashboard/OrgKitchenTable";
import AddKitchenModal from "@/components/dashboard/AddKitchenModal";
import { useLanguage } from "@/context/LanguageContext"; 
// استيراد أيقونات إضافية لتمييز القسم الجديد
import { Phone, Users, Info } from "lucide-react";

export default function OrganizationPage({ searchParams }) {
  const params = use(searchParams);
  const currentPage = Number(params?.page) || 1;
  const { lang } = useLanguage(); 
  const [data, setData] = useState({ kitchens: [], totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const isAr = lang === "ar";

  const refreshData = async () => {
    setIsLoading(true);
    // تأكدي أن الأكشن يجلب الحقول الجديدة (capacity, contact)
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
    ar: { 
      title: "إدارة المطابخ", 
      desc: "إدارة وتعديل وحذف المطابخ التابعة لمؤسستك.",
      statsTitle: "نظرة عامة على البيانات",
      capacityLabel: "إجمالي السعة",
      contactLabel: "دعم فني"
    },
    en: { 
      title: "Kitchen Management", 
      desc: "Manage, edit, and delete your kitchens.",
      statsTitle: "Data Overview",
      capacityLabel: "Total Capacity",
      contactLabel: "Technical Support"
    }
  };
  
  const currentT = t[lang] || t.ar;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8" dir={isAr ? "rtl" : "ltr"}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{currentT.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{currentT.desc}</p>
        </div>

        <AddKitchenModal 
          lang={lang} 
          kitchens={data.kitchens} 
          onSuccess={refreshData} 
        />
      </div>

      {/* 2. قسم معلومات التواصل والسعة السريع (اختياري كـ Dashboard Cards) */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl text-white">
              <Users size={24} />
            </div>
            <div>
              <p className="text-emerald-800 text-xs font-bold uppercase">{currentT.statsTitle}</p>
              <h3 className="text-emerald-900 font-black">
                {isAr ? "يتم عرض السعة والاتصال لكل مطبخ في الجدول أدناه" : "Capacity and contact are listed in the table below"}
              </h3>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-blue-800 text-xs font-bold uppercase">{currentT.contactLabel}</p>
              <h3 className="text-blue-900 font-black">059XXXXXXX</h3>
            </div>
          </div>
        </div>
      )}

      {/* 3. جدول البيانات الرئيسي */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden transition-all duration-500">
        {isLoading ? (
          <div className="p-32 text-center flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-400 font-bold">{isAr ? "جاري جلب بيانات المطابخ..." : "Fetching kitchen data..."}</p>
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

      {/* 4. قسم ملاحظات إدارة السعة */}
      <footer className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 flex items-start gap-3">
        <Info size={20} className="text-gray-400 mt-1 shrink-0" />
        <p className="text-sm text-gray-500 leading-relaxed">
          {isAr 
            ? "تأكد من تحديث أرقام التواصل وسعة الوجبات بشكل دوري لضمان وصول المساعدات للأهالي بدقة." 
            : "Ensure contact numbers and meal capacities are updated regularly to guarantee accurate aid delivery."}
        </p>
      </footer>

    </div>
  );
}