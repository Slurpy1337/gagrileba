import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBar } from "@/components/layout/mobile-bar";
import { siteGraphJsonLd } from "@/lib/seo/jsonld";
import { fallbackImage, site } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

const bpgArial = localFont({
  variable: "--font-georgian",
  src: "./fonts/bpg-arial.woff",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Gagrileba.ge - კონდიციონერები, მონტაჟი და HVAC აქსესუარები",
    template: "%s | Gagrileba.ge",
  },
  description: "კონდიციონერები, HVAC აქსესუარები და პროფესიონალური მონტაჟი საქართველოში. სწრაფი მიწოდება, ოფიციალური გარანტია და BOG გადახდები.",
  applicationName: site.name,
  category: "HVAC ecommerce",
  keywords: [
    "კონდიციონერი",
    "კონდიციონერის მონტაჟი",
    "კონდიციონერები თბილისში",
    "HVAC Georgia",
    "air conditioner Georgia",
    "gagrileba",
  ],
  alternates: {
    canonical: "/",
    languages: {
      ka: "/",
      en: "/",
      ru: "/",
    },
  },
  openGraph: {
    title: "Gagrileba.ge - კონდიციონერები და მონტაჟი",
    description: "შეარჩიეთ კონდიციონერი, მიიღეთ პროფესიონალური მონტაჟი და ოფიციალური გარანტია.",
    url: site.url,
    siteName: "Gagrileba.ge",
    images: [{ url: fallbackImage, width: 1200, height: 630, alt: "Gagrileba.ge HVAC store" }],
    locale: "ka_GE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gagrileba.ge - კონდიციონერები და მონტაჟი",
    description: "კონდიციონერები, აქსესუარები და პროფესიონალური მონტაჟი საქართველოში.",
    images: [fallbackImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${bpgArial.variable} h-full scroll-smooth`}>
      <body className="flex min-h-full flex-col bg-white text-[#0f172a] antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraphJsonLd()) }} />
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBar />
      </body>
    </html>
  );
}
