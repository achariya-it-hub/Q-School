import type { Metadata } from "next";
import "./globals.css";
import { QMasterWidget } from "@/components/q-master-widget";
import { QuantumAmbientOverlay } from "@/components/ui/quantum-effects";

export const metadata: Metadata = {
  title: "Q-School | Thinking, Memory and Confidence Classes for Ages 6–14",
  description:
    "Q-School builds focus, memory, reasoning and confidence in children aged 6–14 through 48 mentor-led classes a year, at 9 centres across 7 cities and online. Book a free demo.",
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
        <QuantumAmbientOverlay />
        {children}
        <QMasterWidget />
      </body>
    </html>
  );
}
