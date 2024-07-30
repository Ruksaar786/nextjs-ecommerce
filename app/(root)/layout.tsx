import type { Metadata } from "next";
import { Poppins as FontSans } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/ui/shared/Header";
import Footer from "@/components/ui/shared/Footer";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nextjs ecommerce",
  description: "Ecommerce created with nextjs and tailwind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <div className="flex h-screen flex-col">
          <Header />
          <main className="flex-1 wrapper">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
