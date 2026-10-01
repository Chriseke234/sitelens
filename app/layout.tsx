import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aigenstra.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Aigenstra — AI Product Engineering & Audit Platform for Vibe Coders",
    template: "%s | Aigenstra",
  },
  description:
    "Aigenstra is an AI-assisted product engineering workspace. Plan, build, debate, and audit your products with a multidisciplinary AI team before you ship.",
  keywords: [
    "AI product development",
    "AI product engineering",
    "vibe coding",
    "AI code audit",
    "AI security audit",
    "website audit",
    "AI development workflow",
    "product engineering assistant",
    "AI software architecture",
    "vibe coding assistant",
  ],
  authors: [{ name: "Aigenstra Team" }],
  creator: "Aigenstra",
  publisher: "Aigenstra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Aigenstra",
    title: "Aigenstra — AI Product Engineering & Audit Platform",
    description:
      "Reduce blind spots before you ship. Build with an AI product team of specialized agents: PM, UX, Architecture, Security, and Auditor.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aigenstra — AI Product Engineering & Audit Platform",
    description:
      "Reduce blind spots before you ship. Build with an AI product team of specialized agents.",
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
    name: "Aigenstra",
    url: baseUrl,
    description:
      "AI-assisted product engineering workspace helping vibe coders plan, debate, structure build prompts, and audit products.",
    applicationCategory: "SoftwareEngineeringApplication",
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
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        {children}
      </body>
    </html>
  );
}
