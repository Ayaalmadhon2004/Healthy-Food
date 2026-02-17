import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorProvider } from "@/context/ErrorProvider";
import { LanguageProvider } from "@/context/LanguageContext"; 
import { cookies } from "next/headers";
import { getCurrentUserRole } from "./actions/authActions";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: { default: "NutriFlow", template: "%s | NutriFlow" },
  description: "Healthy recipes and meals built with Next.js.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ar';
  const role = await getCurrentUserRole();

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4CAF50" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <LanguageProvider initialLang={lang}>
          <Toaster position="top-center" reverseOrder={false}/>
          <ErrorProvider>
            <Navbar userRole={role}/>
            <main className="pt-20">{children}</main>
            <Footer />
          </ErrorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}