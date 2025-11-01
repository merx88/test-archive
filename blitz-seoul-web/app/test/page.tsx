"use client";

import { usePrivy, useWallets, useSendTransaction } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
import { monCharacterAbi } from "../_abis/monCharacter";
import generateImage from "../_utils/nano/generateImg";
import { uploadImage } from "../_utils/r2/uploads";
import { useState } from "react";

const CONTRACT_ADDRESS = "0xdBf90AAC89A4B08a69Aa2204e8AD5Ac88e676E6E";

export default function Test() {
  const { ready, authenticated, connectWallet, logout } = usePrivy();
  const { wallets } = useWallets();
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const { sendTransaction } = useSendTransaction();
  const isWalletConnected = wallets.length > 0;

  const handleConnect = () => {
    connectWallet({
      walletList: ["metamask", "safe"],
      description: "Connect your wallet to access the app",
    });
  };

  const handleLogin = async () => {
    if (wallets[0]) {
      await wallets[0].loginOrLink();
      alert("Logged in with wallet!");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSendTx = async () => {
    const data = encodeFunctionData({
      abi: monCharacterAbi,
      functionName: "mint",
      args: [wallets[0]?.address, "ipfs://bafybeigdyr.../metadata.json"],
    });

    await sendTransaction(
      {
        to: CONTRACT_ADDRESS,
        data,
      },
      {
        address: wallets[0].address,
      }
    );

    alert("mint tx sent!");
  };

  const handleGenerateImage = async (name: string, prompt: string) => {
    const imgBuffer = await generateImage(prompt);
    const url = await uploadImage(imgBuffer, name);
  };

  return !ready ? (
    <div>Loading...</div>
  ) : (
    <div style={{ display: "grid", gap: "12px", maxWidth: 360 }}>
      <h2>Privy Wallet Flow</h2>

      <div>
        <strong>SDK ready:</strong> {ready ? "✅" : "❌"}
      </div>
      <div>
        <strong>Authenticated:</strong> {authenticated ? "✅" : "❌"}
      </div>
      <div>
        <strong>Wallet connected:</strong> {isWalletConnected ? "✅" : "❌"}
      </div>
      {isWalletConnected && (
        <div>
          <strong>Address:</strong> {wallets[0]?.address}
        </div>
      )}

      <button onClick={handleConnect} disabled={!ready}>
        Connect wallet
      </button>

      <button onClick={handleLogin} disabled={!ready}>
        login
      </button>

      <button onClick={handleSendTx} disabled={!isWalletConnected}>
        Send transaction
      </button>

      <button onClick={handleLogout} disabled={!authenticated}>
        Logout (session + wallets)
      </button>

      <h2>Test image generate</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter Your Character Name"
        className="border px-2 py-1"
      />

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter Your Character Prompt"
        className="border px-2 py-1"
      />

      <button
        onClick={() => handleGenerateImage(name || "", prompt || "")}
        disabled={!authenticated}
      >
        generate IMG
      </button>
    </div>
  );
}
