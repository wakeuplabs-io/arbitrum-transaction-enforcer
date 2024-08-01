
export interface Transaction {
  bridgeHash: string;
  delayedInboxHash: string;
  amount: string;
}

export class TransactionsStorageService {
  constructor(private readonly storageKey: string) { }

  getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem(this.storageKey) ?? "[]")
  }

  pushTransaction(tx: Transaction): void {
    const txs = this.getTransactions()

    localStorage.setItem(
      this.storageKey,
      JSON.stringify([...txs, tx])
    );
  }

}

export const transactionsStorageService = new TransactionsStorageService("transactions")