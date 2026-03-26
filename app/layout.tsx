import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import keywordsData from "@/lib/keywords.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
const keywords = keywordsData.map((item: { text: string }) => item.text);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gameslib — Free PC Games Download",
    template: "%s | Gameslib",
  },
   verification: {
    google: 'Oxz_vV17FHU_g0ColbVp2jZ2ANwgg1udZlvwTRMrqgI',
  },
  description: "Download free PC games with direct links, system requirements, and installation guides. Browse 500+ games across all genres.",
  keywords,
  authors: [{ name: "Gameslib", url: SITE_URL }],
  creator: "Gameslib",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Gameslib",
    title: "Gameslib — Free PC Games Download",
    description: "Download free PC games with direct links and installation guides.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Gameslib" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gameslib — Free PC Games Download",
    description: "Download free PC games with direct links and installation guides.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-g-bg text-g-text">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
