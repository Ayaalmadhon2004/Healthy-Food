import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }) {
  const userRole = "USER"; // تجريبي للتأكد من العمل
  const lang = "ar"; 

  return (
    <div className="flex">
      <Sidebar userRole={userRole} lang={lang} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}