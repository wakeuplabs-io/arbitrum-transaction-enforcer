import ArbitrumIcon from "@/assets/arbitrum-icon.svg";
import ArrowRightIcon from "@/assets/arrow-right.svg";
import EthereumIcon from "@/assets/ethereum-icon.svg";
import WalletIcon from "@/assets/wallet.svg";
import CustomConnectButton from "@/components/connect-wallet";
import useArbitrumBalance from "@/hooks/useArbitrumBalance";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import cn from "classnames";
import { parseUnits } from "ethers/lib/utils";
import { useState } from "react";
import { useAccount } from "wagmi";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});

function HomeScreen() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const arbBalance = useArbitrumBalance();
  const { openConnectModal } = useConnectModal();
  const [amountEth, setAmountEth] = useState<string>("0");

  function handleSubmit() {
    const amount = parseUnits(amountEth, 18);
    if (amount.lte("0")) {
      return window.alert("Only values greater than 0");
    } else if (amount.gt(parseUnits(arbBalance, 18))) {
      return window.alert("Not enough balance");
    }

    navigate({ to: "/withdraw", search: { amount: amount.toString() } });
  }

  return (
    <form className="max-w-xl mx-auto" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-6">
        <div className="flex text-left justify-between items-center bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
          <div className="flex flex-row gap-3 items-start">
            <img src={ArbitrumIcon} />
            <div>
              <div className="md:text-sm text-xs text-neutral-500">From</div>
              <div className="font-semibold text-2xl hidden md:block">
                Arbitrum
              </div>
              <div className="font-semibold text-xl md:hidden">ARB</div>
            </div>
          </div>
          <img src={ArrowRightIcon} />
          <div className="flex flex-row gap-3 items-start">
            <img src={EthereumIcon} />
            <div>
              <div className="text-xs md:text-sm text-neutral-500">To</div>
              <div className="font-semibold text-2xl hidden md:block">
                Ethereum
              </div>
              <div className="font-semibold text-xl md:hidden">ETH</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col grow justify-between items-center bg-neutral-50 border border-neutral-200 rounded-2xl p-4 pt-0 h-[21rem]">
          <div className="flex flex-col grow items-center justify-center">
            <input
              id="amount-input"
              value={amountEth}
              onChange={(e) => setAmountEth(e.target.value)}
              placeholder="0"
              type="number"
              className="bg-neutral-50 text-center text-7xl w-full outline-none remove-arrow font-semibold"
            />
          </div>
          <hr className="w-full pb-6" />
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <img src={EthereumIcon} />
              <div className="flex flex-col text-left">
                <div className="font-bold text-xl">ETH</div>
                <div className="text-neutral-500">
                  Balance <span id="balance">{arbBalance.slice(0, 10)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center gap-5">
              <button
                type="button"
                className="btn btn-neutral rounded-3xl px-5"
                onClick={() => setAmountEth(arbBalance)}
              >
                Max
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center flex-col gap-4 bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-3">
              <img src={WalletIcon} />
              <div>Address</div>
            </div>
            <CustomConnectButton className="btn btn-outline rounded-full btn-sm hover:text-gray-500">
              ...
            </CustomConnectButton>
          </div>
          {/* <div className="w-full flex justify-between items-center h-9">
            <div className="flex gap-3">
              <img src={ClockIcon} />
              <div>Transfer Time</div>
            </div>
            <div>~ 24 hours</div>
          </div>
          <div className="w-full flex justify-between items-center h-9">
            <div className="flex gap-3">
              <img src={NoteIcon} />
              <div>Network fees (Ether Gas)</div>
            </div>
            <div className="flex flex-row gap-6">
              <div className="text-neutral-400">~ $85.57</div>
              <div>0.012 ETH</div>
            </div>
          </div> */}
        </div>
        <button
          id="continue-btn"
          onClick={(e) => {
            e.preventDefault();
            if (!address && openConnectModal) {
              openConnectModal();
            } else handleSubmit();
          }}
          type="submit"
          className={cn(
            "btn btn-primary rounded-3xl disabled:text-neutral-200"
          )}
          disabled={!address || !arbBalance}
        >
          {address
            ? arbBalance
              ? "Continue"
              : "Loading balance..."
            : "Connect your wallet to withdraw"}
        </button>
      </div>
    </form>
  );
}
