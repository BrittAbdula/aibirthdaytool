import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import '@/styles/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { SessionProvider } from "next-auth/react"

const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://mewtrucard.com/'),
  title: "MewTruCard - AI Greeting Card Generator",
  description: "Generate personalized Greeting cards using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-57P7BF4D" />
      <body className={`${playfair.className} text-[#4A4A4A]`}>
        <SessionProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </SessionProvider>
        <GoogleAnalytics gaId="G-TR8BTB7YVW" />
      </body>
    </html>
  );
}
