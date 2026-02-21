import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { TransitionProvider } from "@/context/TransitionContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "William Portugal | Portfolio",
    template: "%s | William Portugal",
  },
  description: "Portfolio website showcasing my projects and skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <TransitionProvider>
          <SmoothScrollProvider>
            <Header />
            {/* Main content area - relative to allow header overlay */}
            <main className="flex-grow relative">
              {children}
            </main>
          </SmoothScrollProvider>
        </TransitionProvider>
      </body>
    </html>
  );
}
