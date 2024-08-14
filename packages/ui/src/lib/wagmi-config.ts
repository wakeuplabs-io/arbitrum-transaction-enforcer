import envParsed from "@/envParsed";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "wagmi/chains";

export const l1Chain = envParsed().IS_TESTNET ? sepolia : mainnet;
export const l2Chain = envParsed().IS_TESTNET ? arbitrumSepolia : arbitrum;

const testChains = [arbitrumSepolia, sepolia] as const;
const testTransports = {
  [arbitrumSepolia.id]: http(),
  [sepolia.id]: http(),
};
const chains = [arbitrum, mainnet] as const;
const transports = {
  [arbitrum.id]: http(),
  [mainnet.id]: http(),
};

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

const config = envParsed().IS_TESTNET
  ? createConfig({
      chains: testChains,
      transports: testTransports,
      connectors,
      ssr: false,
    })
  : createConfig({
      chains,
      transports,
      connectors,
      ssr: false,
    });

const supportedchains = chains.map((x) => Number(x.id));
export function isChainSupported(chainId: number) {
  return supportedchains.includes(chainId);
}

export const currentChains = envParsed().IS_TESTNET ? testChains : chains;
export default config;
