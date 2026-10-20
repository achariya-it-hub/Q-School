import type { Metadata } from "next";
import "./globals.css";
import { QMasterWidget } from "@/components/q-master-widget";

export const metadata: Metadata = {
  title: "Q-School — Quantum Schooling",
  description:
    "Q-School: live classes, webinars, workshops and recorded courses — one owned platform for your education business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <QMasterWidget />
      </body>
    </html>
  );
}
