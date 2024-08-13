import ArbitrumIcon from "@/assets/arbitrum-icon.svg";
import EthereumIcon from "@/assets/ethereum-icon.svg";
import WalletIcon from "@/assets/wallet.svg";
import CustomConnectButton from "@/components/connect-wallet";
import ErrorMessage from "@/components/error-message";
import useArbitrumBalance from "@/hooks/useArbitrumBalance";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import cn from "classnames";
import { parseUnits } from "ethers/lib/utils";
import { CircleArrowRight } from 'lucide-react';
import { useState } from "react";
import { useAccount } from "wagmi";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});

interface FormError {
  balance?: boolean, amount?: boolean
}

function HomeScreen() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const arbBalance = useArbitrumBalance();
  const { openConnectModal } = useConnectModal();
  const [amountEth, setAmountEth] = useState<string>("");
  const [error, setError] = useState<FormError>();

  function handleSubmit() {
    const amount = parseUnits(amountEth, 18);
    if (amount.lte("0")) {
      triggerError({ ...error, amount: true });
      return;
    }

    if (amount.gt(parseUnits(arbBalance, 18))) {
      triggerError({ ...error, balance: true });
      return;
    }

    navigate({ to: "/withdraw", search: { amount: amount.toString() } });
  }
  function triggerError(error: FormError) {
    setError(error)
  }

  return (
    <form className="max-w-xl mx-auto" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-6">
        <div className="flex text-left justify-between items-center bg-neutral-50/1 border border-neutral-200 rounded-2xl p-5">
          <div className="flex flex-row gap-3 items-start">
            <img src={ArbitrumIcon} alt="arbitrum icon" />
            <div>
              <div className="md:text-sm text-xs text-neutral-500">From</div>
              <div className="font-semibold text-2xl text-primary-700 hidden md:block">
                Arbitrum
              </div>
              <div className="font-semibold text-xl text-primary-700 md:hidden">ARB</div>
            </div>
          </div>
          <CircleArrowRight strokeWidth={1.5} size={29} color="#363853" />
          <div className="flex flex-row gap-3 items-start">
            <img src={EthereumIcon} alt="ethereum icon" />
            <div>
              <div className="text-xs md:text-sm text-neutral-500">To</div>
              <div className="font-semibold text-2xl text-primary-700 hidden md:block ">
                Ethereum
              </div>
              <div className="font-semibold text-xl text-primary-700 md:hidden">ETH</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col grow justify-between items-center bg-neutral-50/1 border border-neutral-200 rounded-2xl p-4 pt-0 h-[21rem]">
          <div className="flex flex-col grow items-center justify-center">
            <input
              id="amount-input"
              value={amountEth}
              onChange={(e) => { setAmountEth(e.target.value); setError(undefined); }}
              placeholder="0"
              type="number"
              className={cn("flex grow bg-neutral-50/1 text-primary-700 text-center text-7xl w-full outline-none remove-arrow font-semibold duration-200 ease-in-out", { "text-red-600": error })}
            />
            <div className={cn("flex justify-self-end text-red-600 h-8")}>
              {/* <a className={cn("duration-200 ease-in-out", { "opacity-0": !error })}> */}
              {error?.amount && <ErrorMessage label="Only positive amounts allowed" />}
              {error?.balance && <ErrorMessage label="Amount exceeds your balance" />}
              {/* </a> */}
            </div>
          </div>
          <hr className="w-full pb-6" />
          <div className="flex justify-between items-center w-full">
            <div className={cn("flex items-center gap-4")}>
              <img src={EthereumIcon} alt="ethereum icon" />
              <div className="flex flex-col text-left">
                <div className={cn("text-primary-700 font-bold text-xl duration-200 ease-in-out", { "text-red-600": error?.balance })}>ETH</div>
                <span className={cn("text-neutral-500 duration-200 ease-in-out", { "text-red-600": error?.balance })} id="balance">Balance {arbBalance.slice(0, 10)}</span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-5">
              <button
                type="button"
                className="btn btn-neutral rounded-3xl px-5 font-normal"
                onClick={() => setAmountEth(arbBalance)}
              >
                Max
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center flex-col gap-4 bg-neutral-50/1 border border-neutral-200 rounded-2xl p-5">
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-3 text-primary-700">
              <img src={WalletIcon} alt="wallet icon" />
              <div>Address</div>
            </div>
            <CustomConnectButton className="btn btn-outline rounded-full btn-sm hover:text-gray-500 text-primary-700">
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
            "btn btn-primary rounded-3xl disabled:text-neutral-200", { "animate-shake": error }
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
