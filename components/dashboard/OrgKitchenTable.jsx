"use client";

import { useEffect, useState } from "react"; // أضفنا useEffect
import { Edit3, Trash2, ChevronLeft, ChevronRight, MapPin, Clock, Users, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteKitchenAction } from "@/app/actions/kitchenActions";
import Swal from "sweetalert2";

export default function OrgKitchenTable({ 
  initialKitchens = [], 
  lang = "ar", 
  totalPages = 1, 
  currentPage = 1 
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  
  // ✅ إصلاح 1: وضع البيانات في State داخلية لتحديثها فوراً عند الإضافة
  const [kitchens, setKitchens] = useState(initialKitchens);

  // تحديث الحالة الداخلية كلما تغيرت البيانات القادمة من الأب (Props)
  useEffect(() => {
    setKitchens(initialKitchens);
  }, [initialKitchens]);

  const t = {
    ar: {
      searchPlaceholder: "ابحث عن مطبخ أو منطقة...",
      name: "المطبخ",
      location: "الموقع",
      time: "وقت التوزيع",
      capacity: "السعة",
      actions: "الإجراءات",
      next: "التالي",
      prev: "السابق",
      page: "صفحة",
      of: "من",
      noResults: "لا توجد مطابخ مضافة حالياً أو لا يوجد نتائج تطابق بحثك",
      confirmTitle: "هل أنت متأكد؟",
      confirmText: "لن تتمكن من استعادة بيانات هذا المطبخ بعد الحذف!",
      deleteBtn: "نعم، احذف",
      cancelBtn: "إلغاء",
      successDelete: "تم الحذف بنجاح"
    },
    en: {
      searchPlaceholder: "Search kitchen or region...",
      name: "Kitchen",
      location: "Location",
      time: "Dist. Time",
      capacity: "Capacity",
      actions: "Actions",
      next: "Next",
      prev: "Previous",
      page: "Page",
      of: "of",
      noResults: "No kitchens found or no results match your search",
      confirmTitle: "Are you sure?",
      confirmText: "You won't be able to revert this kitchen data!",
      deleteBtn: "Yes, delete",
      cancelBtn: "Cancel",
      successDelete: "Deleted successfully"
    }
  };

  // ✅ إصلاح 2: التأكد من اختيار اللغة بشكل صارم
  const currentT = t[lang] || t["ar"];

  const getText = (field, language) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    // إذا كان كائن، نبحث عن اللغة المطلوبة، وإذا لم توجد نأخذ العربية
    if (typeof field === "object") return field[language] || field["ar"] || "";
    return "";
  };

  const filtered = (kitchens || []).filter((kitchen) => {
    const name = getText(kitchen.name, lang).toLowerCase();
    const region = getText(kitchen.region, lang).toLowerCase();
    const searchTerm = search.toLowerCase();
    return name.includes(searchTerm) || region.includes(searchTerm);
  });

  const goToPage = (pageNumber) => {
    router.push(`?page=${pageNumber}`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: currentT.confirmTitle,
      text: currentT.confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: currentT.deleteBtn,
      cancelButtonText: currentT.cancelBtn,
      customClass: { popup: 'rounded-3xl' }
    });

    if (result.isConfirmed) {
      const response = await deleteKitchenAction(id);
      if (response.success) {
        Swal.fire({
          title: currentT.successDelete,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        router.refresh();
      }
    }
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
      
      {/* شريط البحث */}
      <div className="p-5 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={currentT.searchPlaceholder}
          className="bg-transparent border-none outline-none w-full font-medium text-gray-700 placeholder:text-gray-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* الجدول */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-400 font-bold border-b border-gray-100">
            <tr className="text-[11px] uppercase tracking-wider">
              <th className="px-6 py-4 text-start">{currentT.name}</th>
              <th className="px-6 py-4 text-start">{currentT.location}</th>
              <th className="px-6 py-4 text-start">{currentT.time}</th>
              <th className="px-6 py-4 text-start">{currentT.capacity}</th>
              <th className="px-6 py-4 text-center">{currentT.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((kitchen) => (
                <tr key={kitchen.id} className="hover:bg-green-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {getText(kitchen.name, lang)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-green-500" />
                      {getText(kitchen.region, lang)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {getText(kitchen.distributionTime, lang)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {getText(kitchen.capacity, lang)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <Link
                        href={`/dashboard/organization/${kitchen.id}/edit`}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:border-green-500 hover:text-green-500 hover:shadow-sm transition-all"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(kitchen.id)}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:border-red-500 hover:text-red-500 hover:shadow-sm transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium italic">
                  {currentT.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-5 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl disabled:opacity-30 hover:border-green-500 hover:text-green-500 transition-all text-sm font-bold shadow-sm"
          >
            {lang === "ar" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {currentT.prev}
          </button>

          <div className="px-4 py-2 bg-white rounded-full border border-gray-100 shadow-inner text-xs font-black text-gray-500">
            {currentT.page} <span className="text-green-600 mx-1">{currentPage}</span> {currentT.of} {totalPages}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl disabled:opacity-30 hover:border-green-500 hover:text-green-500 transition-all text-sm font-bold shadow-sm"
          >
            {currentT.next}
            {lang === "ar" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}