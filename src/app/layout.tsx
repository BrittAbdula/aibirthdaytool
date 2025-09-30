import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import '@/styles/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { SessionProvider } from "next-auth/react"
import GoogleAdsense from "@/components/GoogleAdsense";
import Script from "next/script";

const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://mewtrucard.com/'),
  title: "MewTruCard - AI Greeting Card Generator",
  description: "Generate personalized Greeting cards using AI"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name='impact-site-verification' content='775c0013-984f-4645-82d1-36d3f5e90b39' />
        
        {/* Initial consent configuration for GTM/GA */}
        <Script id="consent-config" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'granted',
              'analytics_storage': 'granted',
              'functionality_storage': 'granted',
              'personalization_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted',
              'security_storage': 'granted', // Always needed for security purposes
              'wait_for_update': 500
            });
            gtag('set', 'ads_data_redaction', false);
            gtag('set', 'url_passthrough', true);
          `}
        </Script>
        {/* Google Tag Manager should be inside <head> */}
        <GoogleTagManager gtmId="GTM-57P7BF4D" />
      </head>
      <body className={`${playfair.className} text-[#4A4A4A]`}>
        <SessionProvider>
        <GoogleAdsense />
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
