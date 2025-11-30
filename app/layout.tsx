import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      />
    </head>
      <body>
        <Navbar />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  );
}
