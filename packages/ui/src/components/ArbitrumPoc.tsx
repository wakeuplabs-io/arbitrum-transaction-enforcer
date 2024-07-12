import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import config from "@/lib/wagmiConfig";

import { getL2Network, InboxTools, L2Network } from "@arbitrum/sdk";
import useUserWallet from "@/hooks/useUserWallet";
import { BigNumber } from "@ethersproject/bignumber";
import { ContractTransaction, Signer } from "ethers";
import { Inbox__factory } from "@arbitrum/sdk/dist/lib/abi/factories/Inbox__factory";
import { SequencerInbox__factory } from "@arbitrum/sdk/dist/lib/abi/factories/SequencerInbox__factory";
import { Bridge__factory } from "@arbitrum/sdk/dist/lib/abi/factories/Bridge__factory";

const arbitrumChains = [arbitrum, arbitrumSepolia] as const;

const l2Networks = {
  [mainnet.id]: arbitrum.id,
  [sepolia.id]: arbitrumSepolia.id,
} as const;

const queryClient = new QueryClient();

export default function RainbowKitProviderIntegrated() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ArbitrumPoc />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Mock() {
  return (
    <>
      <ConnectButton />
    </>
  );
}

const submitL2Tx = async (
  tx: {
    to: string;
    value?: BigNumber;
    data?: string;
    nonce: number;
    gasPriceBid: BigNumber;
    gasLimit: BigNumber;
  },
  l2Network: L2Network,
  l1Signer: Signer
): Promise<ContractTransaction> => {
  const inbox = Inbox__factory.connect(l2Network.ethBridge.inbox, l1Signer);

  return await inbox.sendUnsignedTransaction(
    tx.gasLimit,
    tx.gasPriceBid,
    tx.nonce,
    tx.to,
    tx.value || BigNumber.from(0),
    tx.data || "0x"
  );
};

function ArbitrumPoc() {
  const [l1Signer, chain, isLoading, address] = useUserWallet();

  const execute = async () => {
    if (!l1Signer || !chain) {
      return;
    }

    const l2Network = await getL2Network(
      l2Networks[chain.id as keyof typeof l2Networks]
    );

    const sequencerInbox = SequencerInbox__factory.connect(
      l2Network.ethBridge.sequencerInbox,
      l1Signer.provider!
    );

    const bridge = Bridge__factory.connect(
      l2Network.ethBridge.bridge,
      l1Signer.provider!
    );

    const inboxTools = new InboxTools(l1Signer, l2Network);

    const messagesReadBegin = await bridge.sequencerMessageCount();

    const l2Tx = await submitL2Tx(
      {
        to: await l1Signer.getAddress(),
        value: BigNumber.from(0),
        gasLimit: BigNumber.from(100000),
        gasPriceBid: BigNumber.from(21000000000),
        nonce: 0,
      },
      l2Network,
      l1Signer
    );
    await l2Tx.wait();

    const forceInclusionTx = await inboxTools.forceInclude();

    if (forceInclusionTx) {
      await forceInclusionTx.wait();
    }

    const messagesReadEnd = await sequencerInbox.totalDelayedMessagesRead();

    console.log(
      `Messages before: ${messagesReadBegin.toString()} / after: ${messagesReadEnd.toString()}`
    );
  };

  return (
    <>
      <ConnectButton />

      {isLoading && <div>Loading...</div>}

      {address && chain && (
        <div>
          <div>Wallet: {address}</div>
          <div>Chain: {chain.name}</div>
        </div>
      )}

      <br />

      {arbitrumChains.map((chain, index) => (
        <div key={`chain-${index}`}>
          <div>
            Chain: {chain.name} ({chain.id})
          </div>
        </div>
      ))}

      <button onClick={execute}>Execute!</button>
    </>
  );
}
