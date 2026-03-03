import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorProvider } from "@/context/ErrorProvider";
import { LanguageProvider } from "@/context/LanguageContext"; 
import { cookies } from "next/headers";
import { getCurrentUserRole } from "./actions/authActions";
import { Toaster } from "react-hot-toast";
import { UserInitializer } from "@/components/UserInitializer"; 

export const metadata = {
  title: { default: "NutriFlow", template: "%s | NutriFlow" },
  description: "Healthy recipes and meals built with Next.js.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'en';
  const role = await getCurrentUserRole();

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4CAF50" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <LanguageProvider initialLang={lang}>
          {/* 2. تشغيل عملية التحقق من الجلسة فور تحميل المتصفح */}
          <UserInitializer /> 
          
          <Toaster position="top-center" reverseOrder={false}/>
          <ErrorProvider>
            {/* نمرر الـ role كقيمة مبدئية ولكن الـ UserInitializer سيقوم بالتحديث الكامل */}
            <Navbar userRole={role}/>
            <main>{children}</main>
            <Footer />
          </ErrorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}