import { AddToCalendarButton } from "@/components/add-to-calendar";
import { GoogleCalendarIcon } from "@/components/icons";
import useArbitrumBridge, { ClaimStatus } from "@/hooks/useArbitrumBridge";
import { ONE_HOUR } from "@/lib/add-to-calendar";
import { transactionsStorageService } from "@/lib/transactions";
import { getL1BlockTimestamp } from "@/lib/tx-actions";
import {
  ErrorComponent,
  createFileRoute,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import cn from "classnames";
import { ArrowUpRight, Bell, CircleCheck } from 'lucide-react';
import { useEffect, useState } from "react";
import { formatEther } from "viem";

export const Route = createFileRoute("/activity/$tx")({
  loader: async ({ params }) => {
    const tx = transactionsStorageService.getByBridgeHash((params.tx) as `0x${string}` ?? "0x");
    if (!tx) throw notFound();
    return tx;
  },
  errorComponent: ErrorComponent,
  notFoundComponent: () => {
    return <p>Transaction not found</p>;
  },
  component: PostComponent,
});

function PostComponent() {
  const txParam = Route.useLoaderData();
  const navigate = useNavigate();
  const { signer, forceInclude, isForceIncludePossible, getClaimStatus, claimFunds, pushChildTxToParent } = useArbitrumBridge();
  const [canForce, setCanForce] = useState<boolean | undefined>(false);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>();
  const [canConfirm, setCanConfirm] = useState<boolean>();
  const [transaction, setTransaction] = useState(txParam);
  const [remainingHours, setRemainingHours] = useState<number>();

  const enableForce = !remainingHours && canForce && claimStatus && claimStatus === ClaimStatus.PENDING;

  function onConfirm() {
    if (!signer) return;
    pushChildTxToParent(transaction.bridgeHash, signer)
      .then(inboxTx => {
        const updatedTx = { ...transaction, delayedInboxHash: inboxTx };
        setTransaction(updatedTx);
        transactionsStorageService.update(updatedTx);
      })
      .catch((e) =>
        window.alert(
          "Something went wrong, please try again. " + e.message
        )
      );
  }
  function onForce() {
    if (!signer) return;
    forceInclude(signer).catch((e) =>
      window.alert(
        "Something went wrong, please try again. " + e.message
      )
    );
  }
  function onClaim() {
    if (!signer) return;
    claimFunds(transaction.bridgeHash, signer)
      .catch((e) =>
        window.alert(
          "Something went wrong, please try again. " + e.message
        )
      )
  }


  useEffect(() => {
    if (!signer || canConfirm === undefined) return;
    if (canConfirm) {
      setClaimStatus(ClaimStatus.PENDING)
      setCanForce(false);
    }
    else if (!claimStatus)
      getClaimStatus(transaction.bridgeHash).then((x) => {
        setClaimStatus(x);
        if (x === ClaimStatus.PENDING) {
          setCanForce(undefined);
          isForceIncludePossible(signer).then(x => {
            setCanForce(x);
          });
        }
        else
          setCanForce(false);
      })
  }, [signer, canConfirm, claimStatus]);

  useEffect(() => {
    setCanConfirm(!transaction.delayedInboxHash)
    transaction.delayedInboxHash && getL1BlockTimestamp(transaction.delayedInboxHash).then(txTimestamp => {
      const remaining = Math.floor(((txTimestamp + 24 * ONE_HOUR) - new Date().valueOf()) / ONE_HOUR);
      setRemainingHours(remaining < 0 ? 0 : remaining);
    })
  }, [transaction.delayedInboxHash])

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex flex-col items-center">
        <CircleCheck size={48} color="#22C55E" />
        <div className="text-4xl font-semibold mb-6">Hey! Great Job!</div>
        <div className="md:text-xl">
          Your withdrawal request for{" "}
          <b className="font-semibold">
            {formatEther(BigInt(transaction.amount))}
          </b>{" "}
          ETH from <b className="font-semibold">Arbitrum</b> to{" "}
          <b className="font-semibold">Ethereum</b> has been successfully
          initiated
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col text-start justify-between bg-gray-100 border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="flex flex-col grow justify-between md:p-6 p-4 space-y-6">
          <Step
            done
            number={1}
            title="Initiate Withdraw"
            description="Your withdraw transaction in Arbitrum"
            className="pt-2 md:flex md:space-x-4"
          >
            <a
              href={`https://sepolia.arbiscan.io/tx/${transaction.bridgeHash}`}
              target="_blank"
              className="link text-sm flex space-x-1 items-center"
            >
              <span>Arbitrum tx </span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </Step>

          <Step
            done={canConfirm !== undefined && !canConfirm}
            loading={canConfirm === undefined}
            number={2}
            title="Confirm Withdraw"
            description="Send the Arbitrum withdraw transaction through the delayed inbox"
            className="pt-2 space-y-2 md:space-y-0 md:space-x-2 flex items-start flex-col md:flex-row md:items-center"
          >
            {canConfirm &&
              <>
                <button
                  onClick={onConfirm}
                  className="btn btn-primary btn-sm"
                >
                  Confirm
                </button>
              </>
            }
            {!canConfirm && <><a
              href={`https://sepolia.etherscan.io/tx/${transaction.delayedInboxHash}`}
              target="_blank"
              className="link text-sm flex space-x-1 items-center"
            >
              <span>Ethereum delayed inbox tx </span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
              {!canForce && claimStatus === ClaimStatus.PENDING &&
                <AddToCalendarButton
                  className="btn btn-sm space-x-1"
                  event={{
                    title: "Push forward your transaction",
                    description: "Wait is over, if your transaction hasn't go through by now, you can force include it from Arbitrum connect.",
                    startDate: new Date((transaction.timestamp) + 24 * ONE_HOUR),
                    endDate: new Date((transaction.timestamp) + 25 * ONE_HOUR),
                  }}
                >
                  <GoogleCalendarIcon className="h-4 w-4" />
                  <span>Create reminder</span>
                </AddToCalendarButton>
              }</>}
          </Step>
          <Step
            done={(claimStatus === ClaimStatus.CLAIMED && !canForce) || claimStatus === ClaimStatus.CLAIMABLE}
            loading={enableForce === undefined}
            number={3}
            title="Force transaction"
            description="If after 24 hours your Arbitrum transaction hasn't been mined, you can push it forward manually with some extra fee in ethereum"
            className="pt-2 space-y-2 md:space-y-0 md:space-x-2 flex items-start flex-col md:flex-row md:items-center"
          >
            {enableForce &&
              <>
                <button
                  onClick={onForce}
                  className="btn btn-primary btn-sm"
                >
                  Force include
                </button>
              </>
            }
            {!canConfirm && claimStatus === ClaimStatus.PENDING && remainingHours !== undefined && (<a className="text-sm font-semibold">
              <span>{remainingHours} / 24 hs</span>
            </a>)}
          </Step>

          <Step
            done={claimStatus === ClaimStatus.CLAIMED}
            loading={claimStatus === undefined}
            number={4}
            className="pt-2"
            title="Claim funds on Ethereum"
            description="After your transaction has been validated, you can follow the state of it and claim your funds in the arbitrum bridge page by just connecting your wallet."
          >
            {claimStatus === ClaimStatus.CLAIMABLE &&
              <a
                onClick={onClaim}
                target="_blank"
                className="link text-sm flex space-x-1 items-center"
              >
                <span>Claim funds </span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            }
            {claimStatus === ClaimStatus.CLAIMED &&
              <a className="text-sm flex space-x-1 items-center text-green-500 font-semibold">
                <span>claimed</span>
              </a>
            }
            {claimStatus === ClaimStatus.PENDING &&
              <a className="text-sm flex space-x-1 items-center font-semibold">
                <span>pending</span>
              </a>
            }
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
        className={cn("btn btn-primary")}
        style={{
          border: "1px solid black",
          borderRadius: 16,
        }}
        onClick={() => navigate({ to: "/activity" })}
      >
        <Bell />
        Go to my activity
      </button>
      <button
        type="button"
        className={cn("btn btn-secondary")}
        style={{
          border: "1px solid black",
          borderRadius: 16,
        }}
        onClick={() => navigate({ to: "/" })}
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
  done?: boolean;
  loading?: boolean
}) {
  return (
    <div className={"flex items-center justify-between"}>
      <div className="flex space-x-3">
        {!props.done &&
          <div className="h-5 min-w-5 mt-1 flex justify-center items-center rounded-full border-2 border-gray-800">
            {<span className="text-xs">{props.number}</span>}
          </div>
        }
        {props.done && <div className="h-5 min-w-5 mt-1 flex justify-center items-center rounded-full border-2 border-green-500 text-green-500">
          {<span className="text-xs">✓</span>}
        </div>}
        <div>
          <h2 className={cn("text-lg", { "text-green-500": props.done })}>{props.title}</h2>
          <p className="text-sm">{props.description}</p>
          {props.loading && <Spinner />}
          {!props.loading &&
            <div className={props.className}>{props.children}</div>
          }
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-primary"
      role="status">
    </div>)
}