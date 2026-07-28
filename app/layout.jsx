import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorProvider } from "@/context/ErrorProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { cookies } from "next/headers";
import { getCurrentUserRole } from "./actions/authActions";
import { Toaster } from "react-hot-toast";
import { UserInitializer } from "@/components/UserInitializer";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-main",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-headings",
  display: "swap",
});

// Arabic font for improved Arabic rendering
import { Cairo } from 'next/font/google';
const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400','700','900'],
  display: 'swap',
});


export const metadata = {
  title: {
    default: "NutriFlow - Gaza Pulse | منصة الأمن الغذائي الميداني",
    template: "%s | NutriFlow",
  },
  description:
    "أول منصة تفاعلية ذكية لتعزيز الأمن الغذائي الميداني وتحليل الاحتياجات الصحية في قطاع غزة.",
  keywords: ["غزة", "الأمن الغذائي", "التغذية", "الصحة", "الإغاثة", "وصفات بديلة"],
  authors: [{ name: "NutriFlow" }],
  openGraph: {
    title: "NutriFlow - Gaza Pulse",
    description: "منصة الأمن الغذائي الميداني في قطاع غزة",
    type: "website",
    locale: "ar_SA",
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  // تشغيل بالتوازي لتقليل TTFB
  const [serverRole] = await Promise.all([getCurrentUserRole()]);

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${poppins.variable} ${cairo.variable}`}
    >
      <body className="min-h-screen bg-white text-gray-900 antialiased font-sans">
        <LanguageProvider initialLang={lang}>
          <UserInitializer />
          <Toaster position="top-center" reverseOrder={false} />
          <ErrorProvider>
            <Navbar serverRole={serverRole} />
            <main>{children}</main>
            <Footer />
          </ErrorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}