import { InboxTools } from "@arbitrum/sdk";
import { getArbitrumNetwork } from "@arbitrum/sdk/dist/lib/dataEntities/networks";
import { ethers } from "ethers";

export class ArbitrumDelayedInbox {
  constructor(private readonly childChainId: number) {}

  async assembleChildTransaction(l2Signer: ethers.Signer, tx: any) {
    const l2Network = getArbitrumNetwork(this.childChainId);
    const inboxSdk = new InboxTools(l2Signer, l2Network);

    return await inboxSdk.assembleChildTx(tx, l2Signer);
  }

  async signChildTransaction(
    l2Signer: ethers.Signer,
    tx: any
  ): Promise<`0x${string}`> {
    const l2Network = getArbitrumNetwork(this.childChainId);
    const inboxSdk = new InboxTools(l2Signer, l2Network);

    const l2SignedTx = await inboxSdk.signChildTx(tx, l2Signer);
    const l2TxHash = ethers.utils.parseTransaction(l2SignedTx)
      .hash as `0x${string}`;
    if (!l2TxHash) {
      throw new Error("Error signing child transaction");
    }
    return l2TxHash;
  }

  async sendChildTransaction(
    l2Signer: ethers.Signer,
    tx: any
  ): Promise<`0x${string}`> {
    const l2Network = getArbitrumNetwork(this.childChainId);
    const inboxSdk = new InboxTools(l2Signer, l2Network);

    const l2SignedTx = (await inboxSdk.sendChildTx(
      tx,
      l2Signer
    )) as `0x${string}`;

    if (!l2SignedTx) {
      throw new Error("Error signing child transaction");
    }
    return l2SignedTx;
  }

  async sendChildTransactionToParent(
    l1Signer: ethers.Signer,
    l2SignedTx: `0x${string}`
  ): Promise<string> {
    const l2Network = getArbitrumNetwork(this.childChainId);
    const inboxSdk = new InboxTools(l1Signer, l2Network);

    const resultsL1 = await inboxSdk.sendChildSignedTx(l2SignedTx);
    if (resultsL1 == null) {
      throw new Error(`Failed to send tx to l1 delayed inbox!`);
    }
    return resultsL1.hash;
  }

  async canForceInclude(l1Signer: ethers.Signer) {
    const l2Network = getArbitrumNetwork(this.childChainId);
    const inboxSdk = new InboxTools(l1Signer, l2Network);

    return !!(await inboxSdk.getForceIncludableEvent());
  }

  async forceInclude(
    l1Signer: ethers.Signer
  ): Promise<ethers.ContractReceipt | null> {
    const l2Network = getArbitrumNetwork(this.childChainId);
    const inboxTools = new InboxTools(l1Signer, l2Network);

    const forceInclusionTx = await inboxTools.forceInclude();

    if (forceInclusionTx) {
      return await forceInclusionTx.wait();
    } else return null;
  }
}
