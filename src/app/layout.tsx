import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Kalam, Permanent_Marker, Share_Tech_Mono } from "next/font/google";
import { MobileHeader, Toasts, TopChrome, WalletModal } from "@/components/chrome/chrome";
import { PROJECT_NAME, TICKER } from "@/config/site";
import { StoreProvider } from "@/state/store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-barlow", display: "swap" });
const digital = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--font-digital-face", display: "swap" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker-face", display: "swap" });
const hand = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-hand-face", display: "swap" });

export const metadata: Metadata = {
  title: `${PROJECT_NAME}: AI agents you can hand on (simulation)`,
  description: `A front-end simulation: burn 500,000 ${TICKER} to mint a numbered agent with its own wallet. Nothing here touches a real blockchain.`,
};

export const viewport: Viewport = { themeColor: "#fbf8f2" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} ${digital.variable} ${marker.variable} ${hand.variable}`}>
      <body className="min-h-svh">
        <StoreProvider>
          <MobileHeader />
          <TopChrome />
          {children}
          <WalletModal />
          <Toasts />
        </StoreProvider>
      </body>
    </html>
  );
}
