import { useState, useEffect } from "react";
import { Transaction, transactionsStorageService } from "@/lib/transactions";
import { ArrowUpRightIcon, ChevronLeftIcon } from "lucide-react";
import EthereumIcon from "@/assets/ethereum-icon.svg";
import { formatEther } from "viem";
import { shortenAddress } from "@/lib/shorten-address";
import { createFileRoute, Link } from "@tanstack/react-router";

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
        <Link to="/">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="flex text-xl font-semibold">My activity</h1>
      </div>

      <div className="flex">
        <ul className="border w-full rounded-2xl">
          {txHistory.map((x) => (
            <Link to={`/activity/${x.bridgeHash}`}>
              <li
                key={x.bridgeHash}
                className="flex space-x-5 py-5 px-5 rounded-2xl hover:bg-gray-50"
              >
                <img src={EthereumIcon} />
                <div className="flex justify-between w-full items-center">
                  <div>
                    <span className="block">Withdrawal</span>
                    <span className="block">
                      {shortenAddress(x.bridgeHash)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{`${formatEther(BigInt(x.amount))}`} ETH</span>
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </div>
                </div>
              </li>
            </Link>
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
    </div>
  );
}
