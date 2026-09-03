import type { Metadata } from "next";
import { Bebas_Neue, Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const instrument = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} — AI Salary Prediction | Know Your True Worth`, template: `%s | ${BRAND.name}` },
  description:
    "Upload your resume and get instant, skill-weighted salary predictions, market percentile, offer verdicts, job matches and a negotiation brief. US, Canada & UK.",
  metadataBase: new URL(`https://${BRAND.domain}`),
  openGraph: { title: `${BRAND.name} — Know Your True Worth`, description: BRAND.tagline, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${instrument.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg text-fg">
        <SmoothScroll>
          <Nav />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
