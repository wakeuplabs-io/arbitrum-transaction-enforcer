import { Address } from "viem";
import { getWalletHttpsClient } from "@/components/shared/viemClients";

export default class ArbSysService {
  private contractAddress: Address;
  private walletClient;

  constructor(clientAddress: Address, contractAddress: Address) {
    this.walletClient = getWalletHttpsClient(clientAddress);
    this.contractAddress = contractAddress;
  }
}
