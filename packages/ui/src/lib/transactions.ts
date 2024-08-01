
export interface Transaction {
  bridgeHash: string;
  delayedInboxHash: string;
  amount: string;
  timestamp?: number;
}

export class TransactionsStorageService {
  constructor(private readonly storageKey: string) { }

  getAll(): Transaction[] {
    return JSON.parse(localStorage.getItem(this.storageKey) ?? "[]")
  }

  getByBridgeHash(hash: string): Transaction | null {
    return this.getAll().find(t => t.bridgeHash.toLowerCase() === hash.toLowerCase()) ?? null
  }

  create(tx: Transaction): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify([...this.getAll(), tx])
    );
  }

}

export const transactionsStorageService = new TransactionsStorageService("transactions")