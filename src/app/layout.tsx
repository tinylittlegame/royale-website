import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter as safe default for Next 13
import "./globals.css";
import { Providers } from "@/components/Providers";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiny Little Royale",
  description: "A fast-paced 2.5D multiplayer battle game with three modes: Deathmatch, Capture the Flag, and Team Fight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
