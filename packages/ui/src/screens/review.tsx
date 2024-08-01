import ChevronLeftIcon from "@/assets/chevron-left.svg";
import EthIcon from "@/assets/ethereum-icon.svg";
import StepOneIcon from "@/assets/step-one.svg";
import StepThreeIcon from "@/assets/step-three.svg";
import StepTwoIcon from "@/assets/step-two.svg";
import useArbitrumBridge from "@/hooks/useArbitrumBridge";
import TopBarLayout from "@/layouts/topbar";
import { Transaction, transactionsStorageService } from "@/lib/transactions";
import cn from "classnames";
import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ReviewScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amountInWei = searchParams.get("amount");
  const [approvedAproxFees, setApprovedAproxFees] = useState<boolean>(false);
  const [approvedSequencerMaySpeedUp, setApprovedSequencerMaySpeedUp] =
    useState<boolean>(false);
  const [approvedTime, setApprovedTime] = useState<boolean>(false);
  const { initiateWithdraw } = useArbitrumBridge();
  const [loading, setLoading] = useState(false);

  const canContinue = useMemo(() => {
    return approvedAproxFees && approvedSequencerMaySpeedUp && approvedTime;
  }, [approvedAproxFees, approvedSequencerMaySpeedUp, approvedTime]);

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
        navigate(`/activity/${tx.bridgeHash}`);
      })
      .catch((e) => {
        console.error(e);
        window.alert("Something went wrong, please try again");
      })
      .finally(() => setLoading(false));
  }

  if (typeof amountInWei != "string") {
    navigate("/amount");
    return null;
  }

  return (
    <TopBarLayout>
      <div className="flex flex-col max-w-xl mx-auto gap-6">
        <button
          className="flex items-center flex-row gap-3"
          onClick={() => navigate(-1)}
        >
          <img src={ChevronLeftIcon} />
          <div className="font-semibold text-xl">Review and confirm</div>
        </button>

        {/* amount */}
        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl md:p-6 p-4">
          <div className="flex items-center gap-3">
            <img src={EthIcon} />
            <div className="flex items-end space-x-1">
              <div className="text-2xl md:text-4xl font-bold">{`${formatEther(amountInWei)}`}</div>
              <div className="ml-0.5 font-bold">ETH</div>
            </div>
          </div>
          <div className="text-neutral-400">~ - USD</div>
        </div>

        {/* summary */}
        <div className="flex grow justify-between items-center flex-col bg-neutral-50 border border-neutral-200 rounded-2xl p-4 md:p-6 gap-6">
          <div className="bg-[#C2DCFF] text-sm rounded-2xl p-4">
            You are about to withdraw funds from Arbitrum to Ethereum. This
            process requires 2 transactions and gas fees in ETH. Any doubts?{" "}
            <a href="#" className="link">
              Learn More
            </a>
          </div>

          <div className="w-full flex items-center gap-3">
            <img src={StepOneIcon} />
            <div className="flex flex-col md:flex-row md:justify-between w-full">
              <span className="block text-left">Initiate Withdraw</span>
              <div className="flex items-center flex-row gap-2">
                <span className="text-sm">0.012 ETH</span>
                <span className="text-neutral-400 text-sm">~ $-</span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center gap-3">
            <img src={StepTwoIcon} />
            <div className="flex flex-col md:flex-row md:justify-between w-full">
              <p className="text-left">Waiting Period</p>
              <p className="text-left text-sm">~ 24 hours</p>
            </div>
          </div>

          <div className="w-full flex items-center gap-3">
            <img src={StepThreeIcon} />
            <div className="flex flex-col md:flex-row md:justify-between w-full">
              <p className="text-left">Claim funds on Ethereum</p>

              <div className="flex items-center flex-row just gap-3">
                <span className="text-sm">0.026 ETH</span>
                <span className="text-neutral-400 text-sm">~ $-</span>
              </div>
            </div>
          </div>
        </div>

        {/* terms */}
        <div className="flex grow justify-between flex-col text-start bg-neutral-50 border border-neutral-200 rounded-2xl p-4 md:p-6 gap-6">
          <div className="flex gap-4 md:gap-6">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={approvedTime}
              onChange={() => setApprovedTime((v) => !v)}
            />
            <label className="text-sm md:text-base">
              I understand the entire process will take approximately 24 hours
              before I can claim my funds on Ethereum.
            </label>
          </div>
          <div className="flex gap-4 md:gap-6">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={approvedSequencerMaySpeedUp}
              onChange={() => setApprovedSequencerMaySpeedUp((v) => !v)}
            />
            <label className="text-sm md:text-base">
              I understand that once the transaction is initiated, if the
              Sequencer becomes operational again the process can be completed
              before that 24-hour period.
            </label>
          </div>
          <div className="flex gap-4 md:gap-6">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={approvedAproxFees}
              onChange={() => setApprovedAproxFees((v) => !v)}
            />
            <label className="text-sm md:text-base">
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
    </TopBarLayout>
  );
}
