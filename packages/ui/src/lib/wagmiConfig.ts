import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { mainnet, sepolia } from "wagmi/chains";
import { createConfig, http } from "wagmi";

const connectors = connectorsForWallets(
  [
    {
      groupName: "My Wallets",
      wallets: [metaMaskWallet],
    },
  ],
  {
    appName: "Arbitrum PoC",
    projectId: "ARBITRUM_POC",
  }
);

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors,
  ssr: false,
});

export default config;
