import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorProvider } from "@/context/ErrorProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { notFound } from "next/navigation";
import { dirOf, isLocale, LOCALES, otherLocale } from "@/lib/i18n-routing";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { UserInitializer } from "@/components/UserInitializer";
import localFont from "next/font/local";

// Fonts are committed under app/fonts so the build does not need network access
// (next/font/google intermittently failed in CI).
const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  weight: "400 600",
  variable: "--font-main",
  display: "swap",
});

// Headings are always weight 600 (the h1-h6 rule in globals.css wins over font-* utilities), so
// that is the only Poppins file preloaded. Weight 500 only appears on a few large numerals
// (.font-display.font-medium) and is fetched when one of them is on the page.
const poppins = localFont({
  src: "../fonts/poppins-latin-600-normal.woff2",
  weight: "600",
  variable: "--font-headings",
  display: "swap",
});

const poppinsMedium = localFont({
  src: "../fonts/poppins-latin-500-normal.woff2",
  weight: "500",
  variable: "--font-headings-medium",
  display: "swap",
  preload: false,
});

// The site only uses weights 400 to 600 (Tailwind's bold/extrabold/black are mapped to 600 in
// globals.css), so the variable fonts are cut to that range and Poppins ships only 500 and 600.

// Arabic font. Not preloaded: the preload would be sent on every page, English included, and
// Cairo is only requested by the browser when the page is Arabic (see html[lang="ar"] in globals.css).
const cairo = localFont({
  src: "../fonts/cairo-arabic-wght-normal.woff2",
  weight: "400 600",
  variable: "--font-arabic",
  display: "swap",
  preload: false,
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

type LangParams = { params: Promise<{ lang: string }> };

// Both languages are built ahead of time. `dynamicParams = false` is deliberately not set: it would also
// apply to the [id] segments below this layout (recipes, tips), which are rendered on first request.
// Unknown values are rejected with notFound() in the layout, and the proxy never lets one through.

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
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
      alternateLocale: COPY[otherLocale(lang)].locale,
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

export default async function RootLayout({ children, params }: { children: ReactNode } & LangParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      className={`${inter.variable} ${poppins.variable} ${poppinsMedium.variable} ${cairo.variable}`}
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
