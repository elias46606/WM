import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JARVIS // Command Center",
  description: "Persönliches Command-Center für Schule, Projekte & Finanzen.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#03050a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body className="relative min-h-screen bg-void-950">
        <div className="pointer-events-none fixed inset-0 bg-radial-glow" />
        <div className="pointer-events-none fixed inset-0 bg-grid-lines bg-grid opacity-40" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
