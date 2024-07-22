import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  publicActions,
} from "viem";
import { optimismSepolia } from "viem/chains";

export function getChainInfo() {
  //   if (envParsed().IS_TESTNET)
  return optimismSepolia;
  //   return fuse;
}

export const getPublicHttpsClient = () => {
  const chainInfo = getChainInfo();
  //   const rpcUrl = envParsed().IS_TESTNET
  //     ? envParsed().HTTPS_RPC_URL_TESTNET
  //     : envParsed().HTTPS_RPC_URL_MAINNET;
  const rpcUrl =
    "https://opt-sepolia.g.alchemy.com/v2/_XT30-lhP43z_EHHCKjT45uVOJFVhoT0";
  const publicClient = createPublicClient({
    chain: chainInfo,
    transport: http(rpcUrl),
  });

  return publicClient;
};

export const getWalletHttpsClient = (account: Address) => {
  const chainInfo = getChainInfo();

  const walletClient = createWalletClient({
    account,
    chain: chainInfo,
    transport: custom(window.ethereum),
  }).extend(publicActions);

  return walletClient;
};

// export const getPublicWebSocketClient = () => {
//   const chainInfo = getChainInfo();
//   const rpcUrl = envParsed().IS_TESTNET
//     ? envParsed().WSS_RPC_URL_TESTNET
//     : envParsed().WSS_RPC_URL_MAINNET;

//   const publicClient = createPublicClient({
//     chain: chainInfo,
//     transport: webSocket(rpcUrl),
//   });

//   return publicClient;
// };
