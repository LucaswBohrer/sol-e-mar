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
  metadataBase: new URL("https://sol-e-mar-zeta.vercel.app"),
  title: "SOL & MAR — uma viagem, não uma página",
  description:
    "An immersive scroll journey through one day at the shore: a living GLSL ocean, a sun you drag across the sky, a tide you raise with your finger, and waves you play like an instrument.",
  keywords: ["creative web", "interactive design", "motion design", "webgl", "shader", "sol e mar", "sunset", "ocean"],
  authors: [{ name: "SOL & MAR" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "SOL & MAR — uma viagem, não uma página",
    description: "The sun travels, the tide answers, the waves play. A scroll journey, not a page.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOL & MAR — uma viagem, não uma página",
    description: "The sun travels, the tide answers, the waves play. A scroll journey, not a page.",
  },
};

export const viewport = {
  themeColor: "#04101F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-night font-body text-foam">{children}</body>
    </html>
  );
}
