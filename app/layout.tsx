import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "何文字レター",
  description: "手紙・便箋の写真を撮るだけでAIが文字数を自動判別。何文字書けるか一瞬でわかる。便箋・レター用紙に対応。",
  verification: {
    google: '8rdv6-oBxoLXhDcxQa41xRmsPNIYtLRMosa_A3xjWdY',
  },
  openGraph: {
    title: "何文字レター",
    description: "手紙・便箋の写真を撮るだけでAIが文字数を自動判別。何文字書けるか一瞬でわかる。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2913908713051662"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
