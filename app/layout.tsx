import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavWrapper } from "@/components/nav-wrapper";
import { DataProvider } from "@/contexts/data-context";
import { auth } from "@/auth";
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
  title: "Travelbook - Engineering Trip Planner",
  description: "Manage on-site trips, track expenses, and generate reports for engineering projects",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DataProvider session={session}>
          <NavWrapper />
          <main className="container mx-auto pt-20 pb-8 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  );
}
