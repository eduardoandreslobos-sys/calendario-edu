import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MeshBg } from "@/components/effects/MeshBg";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { TOTALS } from "@/lib/events";
import { fmtHours } from "@/lib/format";

const description = `${TOTALS.sessions} sesiones · ${fmtHours(TOTALS.hours)} horas · Mayo a octubre de 2026`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calendario Edu — Compromisos docentes",
  description,
  openGraph: {
    title: "Calendario Edu — Compromisos docentes",
    description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f4ef",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${instrument.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="min-h-screen">
        <MeshBg />
        <GrainOverlay />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
