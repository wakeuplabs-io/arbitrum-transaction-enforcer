import envParsed from "@/envParsed.js";
import { ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";

export const getPublicL1HttpsClient = () => {
  const chainInfo = getL1Chain();

  const publicClient = createPublicClient({
    chain: chainInfo,
    transport: http(envParsed().HTTPS_ETH_RPC_URL),
  });

  return publicClient;
};
export const getPublicL2HttpsClient = () => {
  const chainInfo = getL2Chain();

  const publicClient = createPublicClient({
    chain: chainInfo,
    transport: http(envParsed().HTTPS_ARB_RPC_URL),
  });

  return publicClient;
};

export const getL1Provider = () => {
  const provider = new ethers.providers.JsonRpcProvider(
    envParsed().HTTPS_ETH_RPC_URL
  );

  return provider;
};
export const getL2Provider = () => {
  const provider = new ethers.providers.JsonRpcProvider(
    envParsed().HTTPS_ARB_RPC_URL
  );

  return provider;
};

export function getL1Chain() {
  return envParsed().IS_TESTNET ? sepolia : mainnet;
}

export function getL2Chain() {
  return envParsed().IS_TESTNET ? arbitrumSepolia : arbitrum;
}
