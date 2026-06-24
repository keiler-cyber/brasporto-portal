import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://athena.brasporto.com"),
  title: "Portal Athena — Brasporto",
  description: "Central de aplicações de IA da Brasporto International Logistics.",
  openGraph: {
    title: "Portal Athena — Brasporto",
    description: "Central de aplicações de IA da Brasporto International Logistics.",
    url: "https://athena.brasporto.com",
    siteName: "Portal Athena",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Athena — Brasporto",
    description: "Central de aplicações de IA da Brasporto International Logistics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  );
}
