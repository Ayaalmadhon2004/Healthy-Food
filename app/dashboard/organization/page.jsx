"use client";

// 1. استيراد "use" من ريأكت للتعامل مع الـ Promise
import { useEffect, useState, use } from "react"; 
import { getKitchensAction } from "@/app/actions/kitchenActions";
import OrgKitchenTable from "@/components/dashboard/OrgKitchenTable";
import AddKitchenModal from "@/components/dashboard/AddKitchenModal";
import { Plus } from "lucide-react";

export default function OrganizationPage({ searchParams }) {
  
  // 2. استخدام دالة use لفك searchParams قبل استخراج القيم منها
  const resolvedSearchParams = use(searchParams);
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({ kitchens: [], totalPages: 1 });
  const lang = "ar"; 

  // جلب البيانات عند تغيير الصفحة
  useEffect(() => {
    async function fetchData() {
      const result = await getKitchensAction(currentPage, 5);
      if (result.success) {
        setData({ 
          kitchens: result.kitchens || [], 
          totalPages: result.totalPages || 1 
        });
      }
    }
    fetchData();
  }, [currentPage]);

  const t = {
    ar: { title: "إدارة المطابخ", addBtn: "إضافة مطبخ جديد" },
    en: { title: "Kitchen Management", addBtn: "Add New Kitchen" }
  };
  const currentT = t[lang] || t.ar;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{currentT.title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lang === "ar" 
              ? "يمكنك إدارة وتعديل وحذف المطابخ التابعة لمؤسستك من هنا." 
              : "Manage, edit, and delete your organization's kitchens here."}
          </p>
        </div>

        {showModal && <AddKitchenModal onClose={() => setShowModal(false)} />}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <OrgKitchenTable 
          initialKitchens={data.kitchens} 
          totalPages={data.totalPages}
          currentPage={currentPage}
          lang={lang}
        />
      </div>

      {!data.kitchens?.length && (
        <div className="text-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400">
            {lang === "ar" 
              ? "لا تتوفر مطابخ حالياً، ابدأ بإضافة مطبخك الأول!" 
              : "No kitchens available yet, start by adding your first one!"}
          </p>
        </div>
      )}
    </div>
  );
}