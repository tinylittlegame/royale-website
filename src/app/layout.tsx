import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter as safe default for Next 13
import "./globals.css";
import { Providers } from "@/components/Providers";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiny Little Royale",
  description: "Tiny little royale. โหมดตบฮุนเซนย - A fast-paced 2.5D multiplayer battle game. Fight players worldwide!",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover", // iOS safe area
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tiny Little Royale",
  },
  openGraph: {
    title: "Tiny Little Royale",
    description: "Tiny little royale. โหมดตบฮุนเซนย 🎮",
    url: "https://royaleapp.tinylittle.io",
    siteName: "Tiny Little Royale",
    images: [
      {
        url: "/images/2_icon_husen_512.png",
        width: 512,
        height: 512,
        alt: "Tiny Little Royale - โหมดตบฮุนเซนย",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiny Little Royale",
    description: "Tiny little royale. โหมดตบฮุนเซนย 🎮",
    images: ["/images/2_icon_husen_512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* iOS specific meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
