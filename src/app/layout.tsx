import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { siteConfig } from "@/data/site";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "portfolio",
    "game development",
    "AI",
    "data analysis",
    "forecasting",
    "web development",
    "informatics",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.links.github }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Dark mode by default — the whole design system is dark-first.
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} themed-scrollbar antialiased`}
      >
        <LoadingScreen />
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main className="min-h-svh">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
