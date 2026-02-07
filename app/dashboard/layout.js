import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ملاحظة: الـ Main Navbar تظهر هنا تلقائياً لأنها في الـ Root Layout.
         لذا سنقوم بإزاحة المحتوى للأسفل بمقدار ارتفاع النافبار (غالباً h-16).
      */}
      
      <div className="flex flex-1 pt-16 -mt-16">
        {/* Sidebar للأدوات - سيكون Sticky ليبدأ من تحت النافبار */}
        <Sidebar />

        {/* منطقة المحتوى الرئيسية */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}