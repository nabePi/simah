import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Simah | Aksi, Sinergi, Berdaya",
  description:
    "Simah - Aksi, Sinergi, Berdaya. Minal Aqwal Ilal Af'al - Dari Narasi menuju Aksi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={publicSans.variable}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- variable icon font not available via next/font/google */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        precedence="default"
      />
      <body className="min-h-screen flex flex-col overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
