import ChevronLeftIcon from "@/assets/chevron-left.svg";
import EthIcon from "@/assets/ethereum-icon.svg";
import StepOneIcon from "@/assets/step-one.svg";
import StepThreeIcon from "@/assets/step-three.svg";
import StepTwoIcon from "@/assets/step-two.svg";
import useArbitrumBridge from "@/hooks/useArbitrumBridge";
import TopBarLayout from "@/layouts/topbar";
import { Transaction, transactionsStorageService } from "@/lib/transactions";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import cn from "classnames";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";

type SearchParams = {
  amount: string;
};

export const Route = createFileRoute("/review")({
  component: ReviewScreen,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    try {
      const amount = BigNumber.from(search.amount);
      if (amount.lte("0")) {
        throw new Error("Amount below 0");
      }

      return {
        amount: amount.toString(),
      };
    } catch (e) {
      throw redirect({ to: "/" });
    }
  },
});

function ReviewScreen() {
  const navigate = useNavigate();
  const { amount: amountInWei } = Route.useSearch();

  const [approvedAproxFees, setApprovedAproxFees] = useState<boolean>(false);
  const [approvedSequencerMaySpeedUp, setApprovedSequencerMaySpeedUp] =
    useState<boolean>(false);
  const [approvedTime, setApprovedTime] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const { initiateWithdraw } = useArbitrumBridge();

  function onContinue() {
    setLoading(true);
    initiateWithdraw(amountInWei!)
      .then((x) => {
        const tx: Transaction = {
          bridgeHash: x.l2Txhash,
          delayedInboxHash: x.l1Txhash,
          amount: amountInWei as string,
        };
        transactionsStorageService.create(tx);
        navigate({ to: `/activity/${tx.bridgeHash}` });
      })
      .catch((e) => {
        console.error(e);
        window.alert("Something went wrong, please try again");
      })
      .finally(() => setLoading(false));
  }

  const canContinue = useMemo(() => {
    return approvedAproxFees && approvedSequencerMaySpeedUp && approvedTime;
  }, [approvedAproxFees, approvedSequencerMaySpeedUp, approvedTime]);

  return (
    <div className="flex flex-col max-w-xl mx-auto gap-6">
      <button
        className="flex items-center flex-row gap-3"
        onClick={() => navigate({ to: "/" })}
      >
        <img src={ChevronLeftIcon} />
        <div className="font-semibold text-xl">Review and confirm</div>
      </button>

      {/* amount */}
      <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
        <div className="flex items-center flex-row gap-3">
          <img src={EthIcon} />
          <div className="flex items-end flex-row ">
            <div className="text-4xl font-bold">{`${formatEther(amountInWei)}`}</div>
            <div className="ml-0.5 text-lg font-bold">ETH</div>
          </div>
        </div>
        <div className="text-neutral-400">~ - USD</div>
      </div>

      {/* summary */}
      <div className="flex grow justify-between items-center flex-col bg-neutral-50 border border-neutral-200 rounded-2xl p-6 gap-6">
        <div className="bg-[#C2DCFF] p-6 text-sm rounded-2xl p-4">
          You are about to withdraw funds from Arbitrum to Ethereum. This
          process requires 2 transactions and gas fees in ETH. Any doubts?{" "}
          <a href="#" className="link">
            Learn More
          </a>
        </div>
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-3">
            <img src={StepOneIcon} />
            <div>Initiate Withdraw</div>
          </div>
          <div className="flex items-center flex-row gap-3">
            <div>0.012 ETH</div>
            <div className="text-neutral-400">~ $-</div>
          </div>
        </div>
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-3">
            <img src={StepTwoIcon} />
            <div>Waiting Period</div>
          </div>
          <div>~ 24 hours</div>
        </div>
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-3">
            <img src={StepThreeIcon} />
            <div>Claim funds on Ethereum</div>
          </div>
          <div className="flex items-center flex-row gap-3">
            <div>0.026 ETH</div>
            <div className="text-neutral-400">~ $-</div>
          </div>
        </div>
      </div>

      {/* terms */}
      <div className="flex grow justify-between flex-col text-start bg-neutral-50 border border-neutral-200 rounded-2xl p-6 gap-6">
        <div className="flex gap-6">
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={approvedTime}
            onChange={() => setApprovedTime((v) => !v)}
          />
          <label>
            I understand the entire process will take approximately 24 hours
            before I can claim my funds on Ethereum.
          </label>
        </div>
        <div className="flex gap-6">
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={approvedSequencerMaySpeedUp}
            onChange={() => setApprovedSequencerMaySpeedUp((v) => !v)}
          />
          <label>
            I understand that once the transaction is initiated, if the
            Sequencer becomes operational again the process can be completed
            before that 24-hour period.
          </label>
        </div>
        <div className="flex gap-6">
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={approvedAproxFees}
            onChange={() => setApprovedAproxFees((v) => !v)}
          />
          <label>
            I understand that times and network fees are approximate and may
            change.
          </label>
        </div>
      </div>

      {/* confirm */}
      <button
        type="button"
        className={cn("btn btn-primary", { "btn-disabled": false })}
        style={{
          border: "1px solid black",
          borderRadius: 16,
        }}
        disabled={!canContinue || loading}
        onClick={onContinue}
      >
        {loading ? "Loading..." : "Confirm Withdrawal"}
      </button>
    </div>
  );
}
