import { Address } from "viem";
import { getWalletHttpsClient } from "@/components/shared/viemClients";
import { inboxAbi } from "../../abis/abis";

export default class InboxService {
  private contractAddress: Address;
  private walletClient;

  constructor(clientAddress: Address, contractAddress: Address) {
    this.walletClient = getWalletHttpsClient(clientAddress);
    this.contractAddress = contractAddress;
  }
  async sendUnsignedTransaction(tx: {
    gasLimit: bigint,
    maxFeePerGas: bigint,
    nonce: bigint,
    to: Address,
    value?: bigint,
    data?: Address
} ) {
    const result = await this.walletClient.writeContract({
      address: this.contractAddress,
      abi: inboxAbi,
      args: [
        tx.gasLimit,
        tx.maxFeePerGas,
        tx.nonce,
        tx.to,
        tx.value || BigInt(0),
        tx.data || "0x",
      ],
      functionName: "sendUnsignedTransaction",
    });
    return result;
  }
}
