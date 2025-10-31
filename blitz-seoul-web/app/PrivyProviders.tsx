"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { monadTestnet } from "viem/chains";

const appId = process.env.PRIVY_APP_ID!;
const clientId = process.env.APP_CLIENT_ID;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmh4iua5z021sjv0cp0gbmwz0"
      clientId="client-WY6SHqcPttTLQUbzyH8HVwNWTQhHtScR2cd8Wkr5aZEFW"
      config={{
        defaultChain: monadTestnet,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        supportedChains: [monadTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
