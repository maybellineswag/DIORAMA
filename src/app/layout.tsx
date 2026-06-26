import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
// Apple Garamond is proprietary; EB Garamond is the closest freely-loadable
// Garamond and serves as the web fallback (the .serif stack tries Apple Garamond
// first, so it's used on machines that have it installed).
const garamond = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Diorama — operating system for fashion brands",
  description:
    "Plan collections, track samples, manage manufacturers, and organize your brand's entire creative pipeline in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${garamond.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
