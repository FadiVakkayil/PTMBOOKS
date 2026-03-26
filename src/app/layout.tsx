import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider, AuthGuard } from "@/components/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PTM HSS Thrikkadeeri | Textbook Management",
  description: "Official textbook inventory and accounting system for PTM HSS Thrikkadeeri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} antialiased scroll-smooth`}>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <AuthProvider>
          <AuthGuard>
            <Toaster position="top-center" richColors />
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
