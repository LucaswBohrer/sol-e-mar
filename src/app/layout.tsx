import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sol-e-mar.vercel.app"),
  title: "SOL & MAR — Onde o sol encontra o mar",
  description:
    "An immersive creative web experience about sun, sea, waves and golden hour. Sol & Mar is a living shoreline — floating light, moving water and motion you can actually touch.",
  keywords: ["creative web", "interactive design", "motion", "three.js", "portfolio", "sol e mar", "sunset", "ocean"],
  authors: [{ name: "SOL & MAR" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "SOL & MAR — Onde o sol encontra o mar",
    description: "Where the sun meets the sea. An immersive creative web experience.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOL & MAR — Onde o sol encontra o mar",
    description: "Where the sun meets the sea. An immersive creative web experience.",
  },
};

export const viewport = {
  themeColor: "#E8F4FC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-foam font-body text-ink">{children}</body>
    </html>
  );
}
