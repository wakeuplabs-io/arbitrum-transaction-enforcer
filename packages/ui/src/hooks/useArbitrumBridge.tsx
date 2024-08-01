import "@rainbow-me/rainbowkit/styles.css";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "wagmi/chains";
import {
  ChildToParentMessageStatus,
  ChildTransactionReceipt,
  getArbitrumNetwork,
  InboxTools,
} from "@arbitrum/sdk";
import { ArbSys__factory } from "@arbitrum/sdk/dist/lib/abi/factories/ArbSys__factory";
import { ARB_SYS_ADDRESS } from "@arbitrum/sdk/dist/lib/dataEntities/constants";
import { ethers } from "ethers";
import { useAccount, useSwitchChain } from "wagmi";
import { useEthersSigner } from "./useEthersSigner";
import { useEthersProvider } from "./useEthersProvider";

enum ClaimStatus {
  PENDING = "PENDING",
  CLAIMABLE = "CLAIMABLE",
  CLAIMED = "CLAIMED",
}

const l2Networks = {
  [mainnet.id]: arbitrum.id,
  [sepolia.id]: arbitrumSepolia.id,
} as const;

export default function useArbitrumBridge() {
  const parentChainId = sepolia.id;
  const childNetworkId = l2Networks[parentChainId];
  const {  switchChainAsync } = useSwitchChain();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  async function ensureChainId(chainId: number) {
    await switchChainAsync({ chainId });
  }

  async function getSigner(
    chainId: number
  ): Promise<ethers.providers.JsonRpcSigner> {
    await ensureChainId(chainId);

    if (!signer) throw new Error("No signer");
    return signer;
  }

  async function getProvider(
    chainId: number
  ): Promise<ethers.providers.JsonRpcProvider> {
    // TODO: let's use custom providers
    await ensureChainId(chainId);

    if (!provider) throw new Error("No provider");
    return provider;
  }

  async function sendWithDelayedInbox(tx: any) {
    const l2Network = await getArbitrumNetwork(childNetworkId);
    const inboxSdk = new InboxTools(signer!, l2Network);

    // extract l2's tx hash first so we can check if this tx executed on l2 later.
    const l2Signer = await getSigner(childNetworkId);
    const l2SignedTx = await inboxSdk.signChildTx(tx, l2Signer);
    const l2Txhash = l2SignedTx;

    // send tx to l1 delayed inbox
    await ensureChainId(parentChainId);
    const resultsL1 = await inboxSdk.sendChildSignedTx(l2SignedTx);
    if (resultsL1 == null) {
      throw new Error(`Failed to send tx to l1 delayed inbox!`);
    }
    const inboxRec = await resultsL1.wait();
    console.log("inboxRec", inboxRec)

    return { l2Txhash, l1Txhash: inboxRec.transactionHash };
  }

  async function isForceIncludePossible() {
    const l1Wallet = await getSigner(parentChainId);
    const l2Network = getArbitrumNetwork(childNetworkId);
    const inboxSdk = new InboxTools(l1Wallet, l2Network);

    return !!(await inboxSdk.getForceIncludableEvent());
  }

  async function forceInclude() {
    const l1Wallet = await getSigner(parentChainId);
    const l2Network = getArbitrumNetwork(childNetworkId);
    const inboxTools = new InboxTools(l1Wallet, l2Network);

    if (!(await inboxTools.getForceIncludableEvent())) {
      throw new Error("Force inclusion is not possible");
    }

    const forceInclusionTx = await inboxTools.forceInclude();

    if (forceInclusionTx) {
      return await forceInclusionTx.wait();
    } else return null;
  }

  async function assembleWithdraw(from: string, amountInWei: string) {
    // Assemble a generic withdraw transaction
    const arbsysIface = ArbSys__factory.createInterface();
    const calldatal2 = arbsysIface.encodeFunctionData("withdrawEth", [from]);

    return {
      data: calldatal2,
      to: ARB_SYS_ADDRESS,
      value: amountInWei,
    };
  }

  async function initiateWithdraw(amountInWei: string) {
    if (!address) {
      throw new Error("No address available");
    }

    return await sendWithDelayedInbox(
      await assembleWithdraw(address, amountInWei)
    );
  }

  async function getClaimStatus(l2TxnHash: string): Promise<ClaimStatus> {
    if (!l2TxnHash) {
      throw new Error(
        "Provide a transaction hash of an L2 transaction that sends an L2 to L1 message"
      );
    }
    if (!l2TxnHash.startsWith("0x") || l2TxnHash.trim().length != 66) {
      throw new Error(`Hmm, ${l2TxnHash} doesn't look like a txn hash...`);
    }

    const l2Provider = await getProvider(childNetworkId);

    // First, let's find the Arbitrum txn from the txn hash provided
    const receipt = await l2Provider.getTransactionReceipt(l2TxnHash);
    if (receipt === null) {
      return ClaimStatus.PENDING;
    }
    const l2Receipt = new ChildTransactionReceipt(receipt);

    // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
    // We assume there's only one / just grad the first one.
    const l1Wallet = await getSigner(parentChainId);
    const messages = await l2Receipt.getChildToParentMessages(l1Wallet);
    const l2ToL1Msg = messages[0];

    // Check if already executed
    if (
      (await l2ToL1Msg.status(l2Provider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      return ClaimStatus.CLAIMED;
    }

    // block number of the first block where the message can be executed or null if it already can be executed or has been executed
    const block = await l2ToL1Msg.getFirstExecutableBlock(l2Provider);
    if (block === null) {
      return ClaimStatus.CLAIMABLE;
    } else {
      return ClaimStatus.PENDING;
    }
  }

  async function claimFunds(l2TxnHash: string) {
    if (!l2TxnHash) {
      throw new Error(
        "Provide a transaction hash of an L2 transaction that sends an L2 to L1 message"
      );
    }
    if (!l2TxnHash.startsWith("0x") || l2TxnHash.trim().length != 66) {
      throw new Error(`Hmm, ${l2TxnHash} doesn't look like a txn hash...`);
    }

    // First, let's find the Arbitrum txn from the txn hash provided
    const l2Provider = await getProvider(childNetworkId);
    const receipt = await l2Provider.getTransactionReceipt(l2TxnHash);
    const l2Receipt = new ChildTransactionReceipt(receipt);

    // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
    // We assume there's only one / just grad the first one.
    const l1Wallet = await getSigner(parentChainId);
    const messages = await l2Receipt.getChildToParentMessages(l1Wallet);
    const l2ToL1Msg = messages[0];

    // Check if already executed
    if (
      (await l2ToL1Msg.status(l2Provider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      return null;
    }

    // Now that its confirmed and not executed, we can execute our message in its outbox entry.
    const res = await l2ToL1Msg.execute(l2Provider);
    const rec = await res.wait();

    console.log("Done! Your transaction is executed", rec);
    return rec;
  }

  return {
    isForceIncludePossible,
    forceInclude,
    initiateWithdraw,
    getClaimStatus,
    claimFunds,
  };
}
