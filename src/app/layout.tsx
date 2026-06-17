import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://abc-magico.netlify.app/";

export const metadata: Metadata = {
  title: "ABC Mágico - Alfabetização Infantil",
  description:
    "ABC Mágico - Alfabetização Infantil, aprenda alfabetização de forma divertida",
  keywords: [
    "alfabetizacao",
    "letras",
    "ABC",
    "leitura",
    "infantil",
    "aprendizado",
    "formação",
    "crianças",
    "inicial",
    "brincando",
  ],
  authors: [{ name: "Amilson Monção" }],
  creator: "Amilson Monção",
  publisher: "Amilson Monção",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "ABC Mágico - Alfabetização Infantil",
    description:
      "ABC Mágico - Alfabetização Infantil, aprenda alfabetização de forma divertida",
    siteName: "ABC Mágico",
    locale: "pt_BR",
    images: [
      {
        url: `${SITE_URL}preview.png`,
        width: 1200,
        height: 630,
        alt: "ABC Mágico - Alfabetização Infantil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ABC Mágico - Alfabetização Infantil",
    description:
      "ABC Mágico - Alfabetização Infantil, aprenda alfabetização de forma divertida",
    images: [`${SITE_URL}preview.jpg`],
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%233b82f6'/><text x='50' y='70' font-size='60' text-anchor='middle'>🔤</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground overscroll-none`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
