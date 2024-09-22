import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import '@/styles/globals.css';

const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MewTruCard - AI Birthday Card Generator",
  description: "Generate personalized birthday cards using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.className} bg-[#FFF9F0] text-[#4A4A4A]`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
