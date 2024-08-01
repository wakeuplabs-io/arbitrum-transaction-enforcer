import BellIcon from "@/assets/bell.svg";
import CheckGreenIcon from "@/assets/check-green.svg";
import cn from "classnames";
import { ArrowUpRight } from "lucide-react";
import useArbitrumBridge from "@/hooks/useArbitrum";
import { formatEther } from "viem";
import { Transaction } from "@/lib/transactions";

export default function TransactionResultCard(props: {
  tx: Transaction;
  onGoToActivity: () => unknown;
  onGoHome: () => unknown;
}) {
  const { forceInclude } = useArbitrumBridge();

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex flex-col items-center">
        <img src={CheckGreenIcon} />
        <div className="text-4xl font-semibold mb-6">Hey! Great Job!</div>
        <div className="text-xl">
          Your withdrawal request for{" "}
          <b className="font-semibold">{formatEther(BigInt(props.tx.amount))}</b> ETH from{" "}
          <b className="font-semibold">Arbitrum</b> to{" "}
          <b className="font-semibold">Ethereum</b> has been successfully
          initiated
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col text-start justify-between bg-gray-100 border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="flex flex-col grow justify-between p-6">
          <Step
            number={1}
            title="Initiate Withdraw"
            description="Here your transactions in Arbitrum and the corresponding delayed inbox tx in ethereum"
            className="pt-2 flex space-x-4"
          >
            <a
              href={`https://sepolia.arbiscan.io/tx/${props.tx.bridgeHash}`}
              target="_blank"
              className="link text-sm flex space-x-1 items-center"
            >
              <span>Arbitrum tx </span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href={`https://sepolia.etherscan.io/tx/${props.tx.delayedInboxHash}`}
              target="_blank"
              className="link text-sm flex space-x-1 items-center"
            >
              <span>Ethereum delayed inbox tx </span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </Step>

          <Step
            number={2}
            title="Force transaction"
            description="If after 24 hours your arbutrum transaction hasn't been minted, you can push it forward manually with some extra fee in ethereum"
            className="pt-2"
          >
            <button
              onClick={() => {
                forceInclude().catch((e) =>
                  window.alert(
                    "Something went wrong, please try again. " + e.message
                  )
                );
              }}
              className="btn btn-sm"
            >
              Force include
            </button>
          </Step>

          <Step
            number={3}
            className="pt-2"
            title="Claim funds on Ethereum"
            description="After your transaction has been validated, you can follow the state of it and claim your funds in the arbitrum bridge page by just connecting your wallet."
          >
            <a
              href="https://bridge.arbitrum.io/"
              target="_blank"
              className="link text-sm flex space-x-1 items-center"
            >
              <span>Claim funds </span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </Step>
        </div>

        <div className="bg-gray-200 px-4 py-3">
          <div className="text-sm">
            Have questions about this process?{" "}
            <a className="link">Learn More</a>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={cn("btn btn-primary", { "btn-disabled": false })}
        style={{
          border: "1px solid black",
          borderRadius: 16,
        }}
        onClick={props.onGoToActivity}
      >
        <img src={BellIcon} />
        Go to my activity
      </button>
      <button
        type="button"
        className={cn("btn btn-secondary", {
          "btn-disabled": false,
        })}
        style={{
          border: "1px solid black",
          borderRadius: 16,
        }}
        onClick={props.onGoHome}
      >
        Return home
      </button>
    </div>
  );
}

function Step(props: {
  number: number;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex space-x-3">
        <div className="h-5 min-w-5 mt-1 flex justify-center items-center rounded-full border-2 border-gray-800">
          <span className="text-xs">{props.number}</span>
        </div>

        <div>
          <h2 className={"text-lg"}>{props.title}</h2>
          <p className="text-sm">{props.description}</p>

          <div className={props.className}>{props.children}</div>
        </div>
      </div>
    </div>
  );
}
