import { ClaimStatus } from "@/hooks/useArbitrumBridge";
import { Address } from "viem";

export interface Transaction {
  bridgeHash: Address;
  amount: string;
  delayedInboxTimestamp?: number;
  delayedInboxHash?: Address;
  claimStatus: ClaimStatus;
}

export class TransactionsStorageService {
  constructor(private readonly storageKey: string) {}

  getAll(): Transaction[] {
    return JSON.parse(localStorage.getItem(this.storageKey) ?? "[]");
  }

  getByBridgeHash(hash: Address): Transaction | null {
    return (
      this.getAll().find(
        (t) => t.bridgeHash.toLowerCase() === hash.toLowerCase()
      ) ?? null
    );
  }

  create(tx: Transaction): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify([...this.getAll(), tx])
    );
  }

  update(tx: Transaction): void {
    const txs = this.getAll();
    const txToUpdateIndex = txs.findIndex((x) => x.bridgeHash == tx.bridgeHash);
    txs[txToUpdateIndex] = tx;
    localStorage.setItem(this.storageKey, JSON.stringify([...txs]));
  }
}

export const transactionsStorageService = new TransactionsStorageService(
  "transactions"
);
