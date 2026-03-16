import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorProvider } from "@/context/ErrorProvider";
import { LanguageProvider } from "@/context/LanguageContext"; 
import { cookies } from "next/headers";
import { getCurrentUserRole } from "./actions/authActions";
import { Toaster } from "react-hot-toast";
import { UserInitializer } from "@/components/UserInitializer"; 

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'en';
  const serverRole = await getCurrentUserRole(); // جلب الدور من السيرفر (Cookies)

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <LanguageProvider initialLang={lang}>
          <UserInitializer /> 
          <Toaster position="top-center" reverseOrder={false}/>
          <ErrorProvider>
            {/* نمرر الدور القادم من السيرفر هنا */}
            <Navbar serverRole={serverRole}/> 
            <main>{children}</main>
            <Footer />
          </ErrorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}