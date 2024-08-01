import { useState, useEffect  } from "react";
import { Transaction, transactionsStorageService } from "@/lib/transactions";

export default function TransactionsActivity(props: {
  setCurrentTx: (tx: Transaction) => unknown;
  onBack(): void;
}) {
  const [txHistory, setTxHistory] = useState<Transaction[]>([])

  useEffect(() => {
    setTxHistory(transactionsStorageService.getTransactions())
  }, []);


  return (
    <>
      <div className="flex flex-col max-w-xl mx-auto">
        <div className="flex justify-self-start text-xl font-semibold mb-8">
          My activity
        </div>
        <div className="flex">
          <ul>
            {txHistory.map((x) => (
              <li key={x.bridgeHash} className="list-disc ml-4">
                {shortenAddress(x.bridgeHash)}{" "}
                <button className="link" onClick={() => props.setCurrentTx(x)}>
                  View detail
                </button>
              </li>
            ))}
          </ul>

          {/* <ul className="flex flex-col text-left justify-between items-center border border-neutral-200 rounded-2xl p-5">
            {props.txHistory.map((x, i) => (
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
                  <TransactionStatus txHash={x} />
                </div>
              </li>
            ))}
          </ul> */}
        </div>

        <button className="btn mt-10" onClick={props.onBack}>
          Go back
        </button>
      </div>
    </>
  );
}


function shortenAddress(add: string) {
  return add.slice(0, 4) + "..." + add.slice(add.length - 4)
}