import { Address } from "viem";
import { getWalletHttpsClient } from "@/components/shared/viemClients";
import { sequencerInboxAbi } from "../../abis/abis";
import { BytesLike } from "../../interfaces";

export default class SequencerInboxService {
  private contractAddress: Address;
  private walletClient;

  constructor(clientAddress: Address, contractAddress: Address) {
    this.walletClient = getWalletHttpsClient(clientAddress);
    this.contractAddress = contractAddress;
  }

 
}
