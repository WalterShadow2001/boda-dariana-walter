import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dariana & Walter | Nuestra Boda",
  description: "Organiza y gestiona los proyectos de nuestra boda con control de ventas, gastos y ganancias. Dariana de la Rocha & Walter Piñera.",
  keywords: ["boda", "wedding", "Dariana", "Walter", "proyectos", "organizador", "finanzas"],
  authors: [{ name: "Dariana & Walter" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Dariana & Walter | Nuestra Boda",
    description: "Organiza tus actividades y finanzas para el gran día - Dariana de la Rocha & Walter Piñera",
    type: "website",
    images: ["/icon.svg"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
