import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./layout/Providers";
import MainNav from "@/components/MainNav";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Stamp Network",
  description: "Attestation engine powering Web of Trust (WoT) networks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="stamp.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <MainNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
