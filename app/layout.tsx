import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Explains This Repo - Understand Codebases Faster",
  description: "Professional GitHub repository analysis platform providing AI-powered insights into code quality, security, performance, and architecture. Get actionable recommendations in plain English.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>
      </head>
      <body
        className={`${inter.variable} font-inter antialiased`}
      >
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}
