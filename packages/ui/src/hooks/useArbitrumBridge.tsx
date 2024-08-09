import { getL1Chain, getL1Provider, getL2Chain, getL2Provider } from "@/lib/public-client";
import {
  ChildToParentMessageStatus,
  ChildTransactionReceipt,
  getArbitrumNetwork,
  InboxTools,
} from "@arbitrum/sdk";
import { ArbSys__factory } from "@arbitrum/sdk/dist/lib/abi/factories/ArbSys__factory";
import { ARB_SYS_ADDRESS } from "@arbitrum/sdk/dist/lib/dataEntities/constants";
import "@rainbow-me/rainbowkit/styles.css";
import { ethers } from "ethers";
import { useAccount, useSwitchChain } from "wagmi";
import { useEthersSigner } from "./useEthersSigner";

export enum ClaimStatus {
  PENDING = "PENDING",
  CLAIMABLE = "CLAIMABLE",
  CLAIMED = "CLAIMED",
}

export default function useArbitrumBridge() {
  const parentChainId = getL1Chain().id;
  const childNetworkId = getL2Chain().id;
  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();
  const signer = useEthersSigner({ chainId: parentChainId });
  const l2Network = getArbitrumNetwork(childNetworkId)

  async function ensureChainId(childSigner: ethers.providers.JsonRpcSigner, chainId: number) {
    return childSigner.getChainId()
      .then(x => { if (x !== chainId) switchChainAsync({ chainId }) })
  }

  async function sendWithDelayedInbox(tx: any, childSigner: ethers.providers.JsonRpcSigner) {
    await ensureChainId(childSigner, childNetworkId);
    const inboxSdk = new InboxTools(signer!, l2Network);

    // extract l2's tx hash first so we can check if this tx executed on l2 later.
    const l2Txhash = (await inboxSdk.signChildTx(tx, childSigner)) as `0x${string}`;

    return l2Txhash;
  }

  async function isForceIncludePossible(parentSigner: ethers.providers.JsonRpcSigner) {
    await ensureChainId(parentSigner, parentChainId);
    const inboxSdk = new InboxTools(parentSigner, l2Network);

    return !!(await inboxSdk.getForceIncludableEvent());
  }

  async function forceInclude(parentSigner: ethers.providers.JsonRpcSigner) {
    await ensureChainId(parentSigner, parentChainId);
    const inboxTools = new InboxTools(parentSigner, l2Network);

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

  async function initiateWithdraw(amountInWei: string, childSigner: ethers.providers.JsonRpcSigner) {
    if (!address) {
      throw new Error("No address available");
    }

    return await sendWithDelayedInbox(
      await assembleWithdraw(address, amountInWei), childSigner
    );
  }

  async function pushChildTxToParent(l2SignedTx: `0x${string}`, parentSigner: ethers.providers.JsonRpcSigner) {
    await ensureChainId(parentSigner, parentChainId);
    const l2Network = getArbitrumNetwork(childNetworkId);
    const inboxSdk = new InboxTools(parentSigner, l2Network);

    // send tx to l1 delayed inbox
    const resultsL1 = await inboxSdk.sendChildSignedTx(l2SignedTx);
    if (resultsL1 == null)
      throw new Error(`Failed to send tx to l1 delayed inbox!`);

    const inboxRec = await resultsL1.wait();

    return inboxRec.transactionHash as `0x${string}`
  }

  async function getClaimStatus(l2TxnHash: string): Promise<ClaimStatus> {
    const childProvider = getL2Provider();
    const parentProvider = getL1Provider()

    if (!l2TxnHash) {
      throw new Error(
        "Provide a transaction hash of an L2 transaction that sends an L2 to L1 message"
      );
    }
    if (!l2TxnHash.startsWith("0x") || l2TxnHash.trim().length != 66) {
      throw new Error(`Hmm, ${l2TxnHash} doesn't look like a txn hash...`);
    }

    // First, let's find the Arbitrum txn from the txn hash provided
    const receipt = await childProvider.getTransactionReceipt(l2TxnHash);
    if (receipt === null) {
      return ClaimStatus.PENDING;
    }
    const l2Receipt = new ChildTransactionReceipt(receipt);

    // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
    // We assume there's only one / just grad the first one.
    const messages = await l2Receipt.getChildToParentMessages(parentProvider);
    const l2ToL1Msg = messages[0];

    // Check if already executed
    if (
      (await l2ToL1Msg.status(childProvider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      return ClaimStatus.CLAIMED;
    }

    // block number of the first block where the message can be executed or null if it already can be executed or has been executed
    const block = await l2ToL1Msg.getFirstExecutableBlock(childProvider);
    if (block === null) {
      return ClaimStatus.CLAIMABLE;
    } else {
      return ClaimStatus.PENDING;
    }
  }

  async function claimFunds(l2TxnHash: string, parentSigner: ethers.providers.JsonRpcSigner) {
    const childProvider = getL2Provider();

    if (!l2TxnHash) {
      throw new Error(
        "Provide a transaction hash of an L2 transaction that sends an L2 to L1 message"
      );
    }
    if (!l2TxnHash.startsWith("0x") || l2TxnHash.trim().length != 66) {
      throw new Error(`Hmm, ${l2TxnHash} doesn't look like a txn hash...`);
    }

    // First, let's find the Arbitrum txn from the txn hash provided
    const receipt = await childProvider.getTransactionReceipt(l2TxnHash);
    const l2Receipt = new ChildTransactionReceipt(receipt);

    // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
    // We assume there's only one / just grad the first one.
    const messages = await l2Receipt.getChildToParentMessages(parentSigner);
    const l2ToL1Msg = messages[0];

    // Check if already executed
    if (
      (await l2ToL1Msg.status(childProvider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      return null;
    }

    // Now that its confirmed and not executed, we can execute our message in its outbox entry.
    const res = await l2ToL1Msg.execute(childProvider);
    const rec = await res.wait();

    return rec;
  }

  return {
    isForceIncludePossible,
    forceInclude,
    initiateWithdraw,
    pushChildTxToParent,
    getClaimStatus,
    claimFunds,
    signer
  };
}
