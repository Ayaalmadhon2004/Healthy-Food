import { getKitchensAction } from "@/app/actions/kitchenActions";
import { getCurrentUserRole } from "@/app/actions/authActions";
import { redirect } from "next/navigation";
import OrgKitchenTable from "@/components/dashboard/OrgKitchenTable";
import { Building2} from "lucide-react";
import { cookies } from "next/headers";
import AddKitchenModal from "@/components/dashboard/AddKitchenModal";

export default async function OrganizationPage() {
  const role = await getCurrentUserRole();
  if (role !== "ADMIN" && role !== "ORG") {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";

  const content = {
    ar: {
      title: "إدارة المطابخ الميدانية",
      subtitle: "تحكم في بيانات الوجبات اليومية ومواعيد التوزيع للمناطق المختلفة",
      addBtn: "إضافة مطبخ جديد",
    },
    en: {
      title: "Field Kitchens Management",
      subtitle: "Manage daily meal data and distribution times for different regions",
      addBtn: "Add New Kitchen",
    }
  };

  const t = content[lang];

  const result = await getKitchensAction();
  const kitchens = result.success ? result.kitchens : [];

  return (
    <div className="p-8 max-w-7-xl mx-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Building2 className="text-[var(--color-primary)]" size={32} />
            {t.title}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {t.subtitle}
          </p>
        </div>
        
        <AddKitchenModal lang={lang} />
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <OrgKitchenTable initialKitchens={kitchens} lang={lang} />
      </div>
    </div>
  );
}