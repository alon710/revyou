import type { Metadata } from "next";
import { Rubik, Assistant } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "תשובות AI לביקורות - Google Review AI Reply",
  description:
    "ייצור אוטומטי של תשובות מקצועיות לביקורות לקוחות באמצעות בינה מלאכותית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${rubik.variable} ${assistant.variable} font-sans antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
