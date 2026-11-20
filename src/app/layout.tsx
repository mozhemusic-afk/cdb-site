import type { Metadata, Viewport } from "next";
import "./legacy.css";
import "./site.css";
import { cssVars } from "@/lib/motion-tokens";
import { Before } from "@/components/chrome/before";
import { After } from "@/components/chrome/after";
import { Enhance } from "@/enhance/Enhance";
import { Deferred } from "@/components/Deferred";

const SITE = { name: "CDB Production", url: "https://cdbproduction.com" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "CDB Production · Creative Entertainment Production Studio, Antalya", template: "%s · CDB Production" },
  description: "Independent creative production studio in Antalya. Original show concepts, immersive performances and season-long entertainment programmes for hotels and resorts.",
  openGraph: { type: "website", siteName: SITE.name, locale: "en_GB", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "CDB Production" }] },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] },
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  other: { "msvalidate.01": "0E05D5DCA29F6392F71A25A122A387A8" },
};
export const viewport: Viewport = { themeColor: "#0b0b0c", colorScheme: "dark" };

const orgLd = {
  "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, foundingDate: "2020",
  founder: { "@type": "Person", name: "Cihan Demirbaş" }, address: { "@type": "PostalAddress", addressLocality: "Antalya", addressCountry: "TR" },
  sameAs: ["https://www.instagram.com/cdb.production"],
};

/* Runs before paint: marks JS-enabled pages (reveal states) and skips the opening on repeat visits. */
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('cdb-intro'))d.dataset.intro='seen'}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars() }} />
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link rel="preload" href="/fonts/inter-tight-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/barlow-condensed-latin-500-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body>
        <Before />
        <main id="main">{children}</main>
        <After />
        <Deferred />
        <Enhance />
      </body>
    </html>
  );
}
