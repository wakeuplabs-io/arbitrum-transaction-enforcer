import { useWeb3ClientContext } from "@/contexts/web3-client-context";
import { ITxReq } from "@/lib/get-tx-price";
import { l1Chain, l2Chain } from "@/lib/wagmi-config";
import {
  ChildToParentMessageStatus,
  ChildToParentMessageWriter,
  getArbitrumNetwork,
  InboxTools
} from "@arbitrum/sdk";
import "@rainbow-me/rainbowkit/styles.css";
import { ArbitrumBridge, ArbitrumDelayedInbox } from "arbitrum-force-transaction/src";
import { ethers } from "ethers";
import { Address } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { useEthersSigner } from "./useEthersSigner";
export enum ClaimStatus {
  PENDING = "PENDING",
  CLAIMABLE = "CLAIMABLE",
  CLAIMED = "CLAIMED",
}

export default function useArbitrum() {

  const parentChainId = l1Chain.id;
  const childNetworkId = l2Chain.id;

  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();
  const signer = useEthersSigner({ chainId: parentChainId });
  const l2Network = getArbitrumNetwork(childNetworkId)
  const { parentProvider, childProvider } = useWeb3ClientContext();

  async function ensureChainId(chainId: number) {
    return switchChainAsync({ chainId })
  }

  async function sendWithDelayedInbox(tx: ITxReq, childSigner: ethers.providers.JsonRpcSigner) {
    await ensureChainId(childNetworkId);

    const delayedInbox = new ArbitrumDelayedInbox(l2Network.chainId);
    const l2Txhash = await delayedInbox.sendChildTransaction(childSigner, tx) as Address

    return l2Txhash;
  }

  async function canForceInclude(parentSigner: ethers.providers.JsonRpcSigner) {
    await ensureChainId(parentChainId);

    const delayedInbox = new ArbitrumDelayedInbox(l2Network.chainId)
    const canForceInclude = await delayedInbox.canForceInclude(parentSigner);

    return canForceInclude;
  }

  async function forceInclude(parentSigner: ethers.providers.JsonRpcSigner) {
    await ensureChainId(parentChainId);

    const delayedInbox = new ArbitrumDelayedInbox(l2Network.chainId)
    const forceInclusionTx = await delayedInbox.forceInclude(parentSigner);

    return forceInclusionTx;
  }

  async function initiateWithdraw(amountInWei: string, childSigner: ethers.providers.JsonRpcSigner) {
    if (!address) {
      throw new Error("No address available");
    }

    const bridge = new ArbitrumBridge(childProvider, parentProvider);
    const assemble = await bridge.assembleWithdraw(address, amountInWei);
    return await sendWithDelayedInbox(
      assemble, childSigner
    );
  }

  async function pushChildTxToParent(props: { l2SignedTx: Address, parentSigner: ethers.providers.JsonRpcSigner }) {
    await ensureChainId(parentChainId);
    const l2Network = getArbitrumNetwork(childNetworkId);
    const inboxSdk = new InboxTools(props.parentSigner, l2Network);

    // send tx to l1 delayed inbox
    const childTx = await inboxSdk.sendChildSignedTx(props.l2SignedTx);
    if (childTx == null)
      throw new Error(`Failed to send tx to l1 delayed inbox!`);

    return childTx;
  }

  async function getL2ToL1Msg(l2TxHash: string, parentSigner: ethers.providers.JsonRpcSigner) {
    const bridge = new ArbitrumBridge(childProvider, parentProvider);
    const l2ToL1Msg = await bridge.getL2toL1Msg(l2TxHash, parentSigner);

    return l2ToL1Msg;
  }

  async function getClaimStatus(l2ToL1Msg: ChildToParentMessageWriter): Promise<ClaimStatus> {
    const bridge = new ArbitrumBridge(childProvider, parentProvider);
    const claimStatus = await bridge.getClaimStatus(l2ToL1Msg);

    return claimStatus;
  }

  async function claimFunds(props: { l2ToL1Msg?: ChildToParentMessageWriter, parentSigner: ethers.providers.JsonRpcSigner }) {
    await ensureChainId(parentChainId);
    if (!props.l2ToL1Msg) {
      throw new Error(
        "Provide an L2 transaction that sends an L2 to L1 message"
      );
    }

    // Check if already executed
    if (
      (await props.l2ToL1Msg.status(childProvider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      return null;
    }

    // Now that its confirmed and not executed, we can execute our message in its outbox entry.
    const res = await props.l2ToL1Msg.execute(childProvider);
    const rec = await res.wait();

    return rec;
  }

  return {
    isForceIncludePossible: canForceInclude,
    forceInclude,
    initiateWithdraw,
    pushChildTxToParent,
    getClaimStatus,
    claimFunds,
    getL2ToL1Msg,
    signer
  };
}
