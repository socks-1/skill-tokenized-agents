import type { Metadata } from "next";
import WalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Pump Tokenized Agent Demo",
  description: "Demo payment flow using @pump-fun/agent-payments-sdk",
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
