import type { Metadata } from "next";
import { Lato, Great_Vibes } from "next/font/google";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sitelens.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SiteLens — Website Intelligence & Media Authenticity Platform",
    template: "%s | SiteLens",
  },
  description:
    "SiteLens analyzes websites and digital media to identify technical problems, surface verifiable evidence, and give practical recommendations.",
  keywords: [
    "website audit",
    "website SEO audit",
    "website performance audit",
    "website accessibility audit",
    "website UX audit",
    "website analysis tool",
    "website health check",
    "image authenticity checker",
    "AI image detection",
    "C2PA provenance",
  ],
  authors: [{ name: "SiteLens Team" }],
  creator: "SiteLens",
  publisher: "SiteLens",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "SiteLens",
    title: "SiteLens — Website Intelligence & Media Authenticity Platform",
    description:
      "SiteLens analyzes websites and digital media to identify problems, surface evidence, and deliver actionable insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteLens — Website Intelligence & Media Authenticity Platform",
    description:
      "SiteLens analyzes websites and digital media to identify problems, surface evidence, and deliver actionable insights.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SiteLens",
    url: baseUrl,
    description:
      "Evidence-based website intelligence auditing and digital media authenticity assessment platform.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
  };

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${lato.variable} ${greatVibes.variable} ${lato.className} min-h-full flex flex-col bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
