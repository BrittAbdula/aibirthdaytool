import type { Metadata } from "next";
import { Caveat, Quicksand } from "next/font/google";
import "./globals.css";
import '@/styles/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { SessionProvider } from "next-auth/react"
import GoogleAdsense from "@/components/GoogleAdsense";
import Script from "next/script";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import { buildOrganizationSchema, buildWebsiteSchema, toAbsoluteUrl } from "@/lib/seo";

const caveat = Caveat({ 
  subsets: ["latin"],
  variable: '--font-caveat',
  display: 'swap',
});

const quicksand = Quicksand({ 
  subsets: ["latin"],
  variable: '--font-quicksand',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://mewtrucard.com/'),
  title: {
    default: "AI Greeting Card Generator & Birthday Card Maker | MewTruCard",
    template: "%s",
  },
  description:
    "Create free online birthday cards, valentine cards, apology cards, and shareable greeting card links with MewTruCard's AI card maker.",
  applicationName: "MewTruCard",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://mewtrucard.com/",
    siteName: "MewTruCard",
    title: "AI Greeting Card Generator & Birthday Card Maker | MewTruCard",
    description:
      "Create birthday cards, greeting cards, and shareable card links with AI on MewTruCard.",
    images: [
      {
        url: toAbsoluteUrl("/og-cover.jpg"),
        width: 1200,
        height: 630,
        alt: "MewTruCard greeting card generator preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Greeting Card Generator & Birthday Card Maker | MewTruCard",
    description:
      "Create birthday cards, greeting cards, and shareable card links with AI on MewTruCard.",
    images: [toAbsoluteUrl("/og-cover.jpg")],
  },
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
      <body className={`${caveat.variable} ${quicksand.variable} font-sans text-[#2D2D2D]`}>
        <JsonLd data={buildOrganizationSchema()} />
        <JsonLd data={buildWebsiteSchema()} />
        <SessionProvider>
          <GoogleAdsense />
          <AppShell>{children}</AppShell>
          <Toaster />
        </SessionProvider>
        <GoogleAnalytics gaId="G-TR8BTB7YVW" />
      </body>
    </html>
  );
}
