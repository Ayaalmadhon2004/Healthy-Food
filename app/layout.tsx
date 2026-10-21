import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorProvider } from "@/context/ErrorProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { UserInitializer } from "@/components/UserInitializer";
import localFont from "next/font/local";

// Fonts are committed under app/fonts so the build does not need network access
// (next/font/google intermittently failed in CI).
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-main",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-headings",
  display: "swap",
});

// Arabic font for improved Arabic rendering
const cairo = localFont({
  src: "./fonts/cairo-arabic-wght-normal.woff2",
  weight: "200 1000",
  variable: "--font-arabic",
  display: "swap",
});


export const metadata = {
  manifest: "/manifest.json",
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${poppins.variable} ${cairo.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <LanguageProvider initialLang={lang}>
          <UserInitializer />
          <Toaster position="top-center" reverseOrder={false} />
          <ErrorProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ErrorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}