import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import { ErrorProvider } from "@/context/ErrorProvider";
import { ReactNode } from "react";

export const metadata:Metadata = {
  title: { default: "NutriFlow", template: "%s | NutriFlow" },
  description: "Healthy recipes and meals built with Next.js.",
};

export default function RootLayout({ children }:{children:ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4CAF50" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <ErrorProvider>
            <Navbar />
            <main className="pt-20">{children}</main>
            <Footer />
        </ErrorProvider>
      </body>
    </html>
  );
}
