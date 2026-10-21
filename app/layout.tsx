import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorProvider } from "@/context/ErrorProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { getServerLang } from "@/lib/i18n";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
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


const COPY = {
  ar: {
    title: "NutriFlow | غذاء صحي لكل بيت في غزة",
    description:
      "وجبات مجانية من المطابخ المجتمعية، ووصفات من مكونات متوفرة، ونصائح صحية من أطباء وأخصائيي تغذية في قطاع غزة.",
    skip: "تخطّ إلى المحتوى",
    locale: "ar_AR",
  },
  en: {
    title: "NutriFlow | Eating well in Gaza",
    description:
      "Free meals from community kitchens, recipes made from ingredients that are available, and health advice from doctors and dietitians in Gaza.",
    skip: "Skip to content",
    locale: "en_US",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const c = COPY[lang];
  return {
    metadataBase: getSiteUrl(),
    applicationName: SITE_NAME,
    manifest: "/manifest.json",
    title: { default: c.title, template: `%s | ${SITE_NAME}` },
    description: c.description,
    // "./" resolves to each page's own URL, so every route gets a self-referencing canonical.
    alternates: { canonical: "./" },
    authors: [{ name: SITE_NAME }],
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: c.title,
      description: c.description,
      locale: c.locale,
    },
    twitter: { card: "summary_large_image", title: c.title, description: c.description },
    appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the navbar background so the mobile browser chrome blends in.
  themeColor: "#f6f0e3",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = await getServerLang();

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${poppins.variable} ${cairo.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[60] focus:rounded-md focus:bg-olive-800 focus:px-4 focus:py-2.5 focus:text-white"
        >
          {COPY[lang].skip}
        </a>
        <LanguageProvider initialLang={lang}>
          <UserInitializer />
          <ErrorProvider>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer lang={lang} />
          </ErrorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
