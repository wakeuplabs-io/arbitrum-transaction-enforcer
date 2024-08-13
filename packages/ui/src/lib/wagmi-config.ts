import arbitrumIcon from "@/assets/arbitrum-icon.svg";
import ethereumIcon from "@/assets/ethereum-icon.svg";
import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { arbitrumSepolia, sepolia } from "wagmi/chains";

export const chains: readonly [Chain, ...Chain[]] = [
  { ...arbitrumSepolia, iconUrl: arbitrumIcon },
  {
    ...sepolia,
    iconUrl: ethereumIcon,
  },
];
const config = createConfig({
  chains,
  transports: {
    [arbitrumSepolia.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: connectorsForWallets(
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
  ),
  ssr: false,
});

const supportedchains = chains.map((x) => Number(x.id));
export function isChainSupported(chainId: number) {
  return supportedchains.includes(chainId);
}

export default config;
