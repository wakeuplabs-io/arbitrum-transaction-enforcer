
export interface Transaction {
  bridgeHash: string;
  delayedInboxHash: string;
  amount: string;
}

export class TransactionsStorageService {
  constructor(private readonly storageKey: string) { }

  getAll(): Transaction[] {
    return JSON.parse(localStorage.getItem(this.storageKey) ?? "[]")
  }

  getByBridgeHash(hash: string): Transaction | null {
    const txs = this.getAll()
    return txs.find(t => t.bridgeHash.toLowerCase() === hash.toLowerCase()) ?? null
  }

  create(tx: Transaction): void {
    const txs = this.getAll()

    localStorage.setItem(
      this.storageKey,
      JSON.stringify([...txs, tx])
    );
  }

}

export const transactionsStorageService = new TransactionsStorageService("transactions")