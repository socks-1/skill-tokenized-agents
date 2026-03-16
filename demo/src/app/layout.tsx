import type { Metadata } from "next";
import WalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Tokenized Agent Payments Demo",
  description: "Multi-chain AI agent payment flow — Solana (pump.fun) and EVM (x402 / Base)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f9f9f9" }}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
