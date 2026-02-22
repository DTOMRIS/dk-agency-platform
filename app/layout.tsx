import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookiesBanner from "@/components/ui/CookiesBanner";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import AttributionCapture from "@/components/marketing/AttributionCapture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dkagency.az"),
  title: "DK Agency | HoReCa Platformasi",
  description: "Azerbaycan HoReCa sektoru ucun media, toolkit, marketplace ve danismanliq platformasi.",
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "DK Agency",
    description: "Media + Toolkit + Marketplace + Danismanliq",
    url: "https://dkagency.az",
    siteName: "DK Agency",
    locale: "az_AZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DK Agency",
    description: "HoReCa platformasi: xeberler, aletler, ilanlar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A1A] text-[#EAEAEA] min-h-screen`}>
        <AttributionCapture />
        <Header />
        <main className="pt-16 pb-20 md:pb-0">{children}</main>
        <MobileBottomNav />
        <Footer />
        <CookiesBanner />
      </body>
    </html>
  );
}

