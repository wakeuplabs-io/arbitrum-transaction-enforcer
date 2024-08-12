import EthereumIcon from "@/assets/ethereum-icon.svg";
import { TransactionStatus } from "@/components/transaction/status";
import { Transaction, transactionsStorageService } from "@/lib/transactions";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/activity/")({
  component: ActivityScreen,
});

function ActivityScreen() {
  const [txHistory, setTxHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    setTxHistory(transactionsStorageService.getAll());
  }, []);

  return (
    <div className="flex flex-col max-w-xl mx-auto">
      <div className="flex space-x-3 items-center mb-8">
        <h1 className="flex text-xl font-semibold">My activity</h1>
      </div>
      <ul className="flex flex-col text-left justify-between items-center border border-neutral-200 rounded-2xl p-5">
        {txHistory.map((x, i) => (
          <li
            className="collapse collapse-arrow join-item"
            key={`collapsable-${i}`}
          >
            <input type="radio" name="accordion" />
            <div className="collapse-title text-lg flex items-center justify-between after:traslate-y-0">
              <div className="flex gap-3 items-center">
                <img src={EthereumIcon} />
                <div className="">Withdrawal</div>
              </div>
              <div className="flex items-center">0.0005 ETH</div>
            </div>
            <div className="collapse-content">
              <TransactionStatus tx={x} isActive={false} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
