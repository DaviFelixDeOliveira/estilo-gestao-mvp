import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestão para barbearias",
  description: "Sistema completo de gestão, PDV, estoque e operação para barbearias.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
