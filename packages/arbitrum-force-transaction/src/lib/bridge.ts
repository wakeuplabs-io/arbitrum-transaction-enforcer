import {
  ChildToParentMessageStatus,
  ChildToParentMessageWriter,
  ChildTransactionReceipt,
} from "@arbitrum/sdk";
import { ArbSys__factory } from "@arbitrum/sdk/dist/lib/abi/factories/ArbSys__factory";
import { ARB_SYS_ADDRESS } from "@arbitrum/sdk/dist/lib/dataEntities/constants";
import { ethers, providers } from "ethers";

export enum ClaimStatus {
  PENDING = "PENDING",
  CLAIMABLE = "CLAIMABLE",
  CLAIMED = "CLAIMED",
}

export class ArbitrumBridge {
  constructor(
    private readonly childProvider: providers.Provider,
    private readonly parentProvider: providers.Provider
  ) {}

  // Assemble a generic withdraw transaction
  async assembleWithdraw(
    from: string,
    amountInWei: string
  ): Promise<{ data: `0x${string}`; to: `0x${string}`; value: bigint }> {
    const arbSys = ArbSys__factory.connect(
      ARB_SYS_ADDRESS,
      this.parentProvider
    );
    const arbsysIface = arbSys.interface;
    const calldatal2 = arbsysIface.encodeFunctionData("withdrawEth", [
      from,
    ]) as `0x${string}`;

    return {
      data: calldatal2,
      to: ARB_SYS_ADDRESS,
      value: BigInt(amountInWei),
    };
  }

  async getClaimStatus(
    l2ToL1Msg: ChildToParentMessageWriter
  ): Promise<ClaimStatus> {
    if (!l2ToL1Msg) {
      throw new Error(
        "Provide an L2 transaction that sends an L2 to L1 message or the message itself"
      );
    }

    if (!l2ToL1Msg) return ClaimStatus.PENDING;

    // Check if already executed
    if (
      (await l2ToL1Msg.status(this.childProvider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      return ClaimStatus.CLAIMED;
    }
    // block number of the first block where the message can be executed or null if it already can be executed or has been executed
    const block = await l2ToL1Msg.getFirstExecutableBlock(this.childProvider);
    if (block === null) {
      return ClaimStatus.CLAIMABLE;
    } else {
      return ClaimStatus.PENDING;
    }
  }

  async getL2toL1Msg(l2TxnHash: string, parentSigner: ethers.Signer) {
    if (!l2TxnHash.startsWith("0x") || l2TxnHash.trim().length != 66)
      throw new Error(`Hmm, ${l2TxnHash} doesn't look like a txn hash...`);

    // First, let's find the Arbitrum txn from the txn hash provided
    const receipt = await this.childProvider.getTransactionReceipt(l2TxnHash);
    if (receipt === null) return undefined;

    const l2Receipt = new ChildTransactionReceipt(receipt);
    // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
    // We assume there's only one / just grad the first one.
    const messages = await l2Receipt.getChildToParentMessages(parentSigner);

    return messages[0];
  }

  async claim(
    txnHash: string,
    l1Wallet: ethers.Signer
  ): Promise<string | null> {
    // First, let's find the Arbitrum txn from the txn hash provided
    const receipt = await this.parentProvider.getTransactionReceipt(txnHash);
    const l2Receipt = new ChildTransactionReceipt(receipt);

    // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
    // We assume there's only one / just grad the first one.
    const messages = await l2Receipt.getChildToParentMessages(l1Wallet);
    const l2ToL1Msg = messages[0];

    // Check if already executed
    if (
      (await l2ToL1Msg.status(this.parentProvider)) ==
      ChildToParentMessageStatus.EXECUTED
    ) {
      return null;
    }

    // Now that its confirmed and not executed, we can execute our message in its outbox entry.
    const res = await l2ToL1Msg.execute(this.parentProvider);

    return res.hash;
  }
}
