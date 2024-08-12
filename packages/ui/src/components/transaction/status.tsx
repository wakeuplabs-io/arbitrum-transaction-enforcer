import useArbitrumBridge, { ClaimStatus } from "@/hooks/useArbitrumBridge";
import useOnScreen from "@/hooks/useOnScreen";
import { Transaction, transactionsStorageService } from "@/lib/transactions";
import { getL1BlockTimestamp } from "@/lib/tx-actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import cn from "classnames";
import { addDays, addHours, intervalToDuration } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AddToCalendarButton } from "../add-to-calendar";
import { GoogleCalendarIcon } from "../icons";
import { StatusStep } from "./status-step";

export function TransactionStatus(props: {
    tx: Transaction;
    isActive: boolean;
}) {
    const {
        signer,
        forceInclude,
        isForceIncludePossible,
        getClaimStatus,
        claimFunds,
        pushChildTxToParent,
    } = useArbitrumBridge();
    const [remainingHours, setRemainingHours] = useState<number>();
    const [isClaiming, setIsClaiming] = useState<boolean>(false);
    const [isForcing, setIsForcing] = useState<boolean>(false);
    const [transaction, setTransaction] = useState<Transaction>(props.tx);
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    const forceIncludeTx = useMutation({
        mutationFn: forceInclude,
        onSuccess: () => setIsForcing(false),
        onError: (e) =>
            window.alert("Something went wrong, please try again. " + e.message),
    });
    const confirmTx = useMutation({
        mutationFn: pushChildTxToParent,
        onSuccess: (inboxTx) => {
            updateTx({
                ...transaction,
                delayedInboxHash: inboxTx,
                confirmed: true,
            });
        },
        onError: (e) =>
            window.alert("Something went wrong, please try again. " + e.message),
    });
    const { data: claimStatusData, isFetching: fetchingClaimStatus } = useQuery({
        queryKey: ["claimStatus", transaction.bridgeHash],
        queryFn: () => getClaimStatus(transaction.bridgeHash!),
        enabled:
            isVisible &&
            !!transaction.delayedInboxHash &&
            transaction.claimStatus !== ClaimStatus.CLAIMED,
    });

    const { data: canForceInclude, isFetching: fetchingForceIncludeStatus } =
        useQuery({
            queryKey: ["forceIncludeStatus", transaction.delayedInboxHash],
            queryFn: () => isForceIncludePossible(signer!),
            enabled:
                isVisible &&
                !!signer &&
                remainingHours === 0 &&
                transaction.claimStatus === ClaimStatus.PENDING,
        });

    const { data: delayedTxTimestamp, isFetching: fetchingDelayedTxTimestamp } =
        useQuery({
            queryKey: ["delayedInboxTimestamp", transaction.delayedInboxHash],
            queryFn: () => getL1BlockTimestamp(transaction.delayedInboxHash!),
            enabled: transaction.delayedInboxHash && !transaction.timestamp,
        });

    function recalculateRemainingHours(timestamp: number) {
        const dueDate = addDays(timestamp, 1);
        const remainingHours = intervalToDuration({
            start: Date.now(),
            end: dueDate,
        }).hours;

        if (remainingHours === undefined)
            throw new Error("unexpected error calculating due time");

        setRemainingHours(remainingHours < 0 ? 0 : remainingHours);
    }

    useEffect(() => {
        if (transaction.timestamp) recalculateRemainingHours(transaction.timestamp);
        else if (delayedTxTimestamp) {
            updateTx({ ...transaction, timestamp: delayedTxTimestamp });
        }
    }, [delayedTxTimestamp, transaction.timestamp]);

    useEffect(() => {
        if (claimStatusData && claimStatusData !== ClaimStatus.PENDING)
            updateTx({ ...transaction, claimStatus: claimStatusData });
    }, [claimStatusData]);

    function updateTx(updatedTx: Transaction) {
        setTransaction(updatedTx);
        transactionsStorageService.update(updatedTx);
    }

    function onConfirm() {
        if (!signer) return;

        confirmTx.mutate({
            l2SignedTx: transaction.bridgeHash,
            parentSigner: signer,
        });
    }
    function onForce() {
        if (!signer) return;

        setIsForcing(true);
        forceIncludeTx.mutate(signer);
    }
    function onClaim() {
        if (!signer) return;

        setIsClaiming(true);
        claimFunds(transaction.bridgeHash, signer)
            .then(() => {
                updateTx({ ...transaction, claimStatus: ClaimStatus.CLAIMED });
                setIsClaiming(false);
            })
            .catch((e) =>
                window.alert("Something went wrong, please try again. " + e.message)
            );
    }

    useEffect(() => {
        if (!isVisible || !transaction.confirmed || !transaction.delayedInboxHash)
            return;

        if (!transaction.timestamp) {
        }
    }, [transaction.delayedInboxHash, isVisible]);

    return (
        <div className="flex flex-col text-start justify-between bg-gray-100 border border-neutral-200 rounded-2xl overflow-hidden">
            <div ref={ref} className="flex flex-col grow justify-between md:p-6">
                <StatusStep
                    done
                    number={1}
                    title="Initiate Withdraw"
                    description="Your withdraw transaction in Arbitrum"
                    className="pt-2 md:flex md:space-x-4 mb-4"
                >
                    <a
                        href={`https://sepolia.arbiscan.io/tx/${transaction.bridgeHash}`}
                        target="_blank"
                        className="link text-sm flex space-x-1 items-center"
                    >
                        <span>Arbitrum tx </span>
                        <ArrowUpRight className="h-3 w-3" />
                    </a>
                </StatusStep>
                <StatusStep
                    done={!!transaction.delayedInboxHash}
                    active={!transaction.delayedInboxHash}
                    running={confirmTx.isPending || fetchingDelayedTxTimestamp}
                    number={2}
                    title="Confirm Withdraw"
                    description="Send the Arbitrum withdraw transaction through the delayed inbox"
                    className="pt-2 space-y-2 md:space-y-0 md:space-x-2 mb-4 flex items-start flex-col md:flex-row md:items-center"
                >
                    {!transaction.delayedInboxHash &&
                        !confirmTx.isPending &&
                        !fetchingDelayedTxTimestamp && (
                            <button onClick={onConfirm} className="btn btn-primary btn-sm">
                                Confirm
                            </button>
                        )}
                    {transaction.delayedInboxHash && (
                        <>
                            <a
                                href={`https://sepolia.etherscan.io/tx/${transaction.delayedInboxHash}`}
                                target="_blank"
                                className="link text-sm flex space-x-1 items-center "
                            >
                                <span>Ethereum delayed inbox tx </span>
                                <ArrowUpRight className="h-3 w-3" />
                            </a>
                        </>
                    )}
                </StatusStep>
                <StatusStep
                    done={
                        [ClaimStatus.CLAIMED, ClaimStatus.CLAIMABLE].includes(
                            transaction.claimStatus
                        ) && !fetchingClaimStatus
                    }
                    active={
                        transaction.delayedInboxHash &&
                        transaction.claimStatus === ClaimStatus.PENDING &&
                        !fetchingClaimStatus
                    }
                    running={isForcing || fetchingForceIncludeStatus}
                    number={3}
                    title="Force transaction"
                    description="If after 24 hours your Arbitrum transaction hasn't been mined, you can push it forward manually with some extra fee in ethereum"
                    className="flex flex-col items-start pt-2 space-y-2 md:space-y-0 md:space-x-2 mb-4 md:flex-row md:items-center"
                >
                    {canForceInclude && (
                        <button onClick={onForce} className="btn btn-primary btn-sm">
                            Force include
                        </button>
                    )}
                    {!canForceInclude &&
                        transaction.claimStatus === ClaimStatus.PENDING &&
                        transaction.timestamp &&
                        remainingHours !== undefined && (
                            <>
                                <a className="text-sm font-semibold">
                                    ~ {remainingHours} hours remaining
                                </a>
                                <AddToCalendarButton
                                    className="btn btn-sm space-x-1"
                                    event={{
                                        title: "Push forward your transaction",
                                        description:
                                            "Wait is over, if your transaction hasn't go through by now, you can force include it from Arbitrum connect.",
                                        startDate: addHours(transaction.timestamp, 24),
                                        endDate: addHours(transaction.timestamp, 25),
                                    }}
                                >
                                    <GoogleCalendarIcon className="h-4 w-4" />
                                    <span>Create reminder</span>
                                </AddToCalendarButton>
                            </>
                        )}
                </StatusStep>

                <StatusStep
                    done={transaction.claimStatus === ClaimStatus.CLAIMED}
                    active={
                        transaction.claimStatus === ClaimStatus.CLAIMABLE ||
                        (transaction.claimStatus === ClaimStatus.PENDING &&
                            fetchingClaimStatus)
                    }
                    running={isClaiming || fetchingClaimStatus}
                    number={4}
                    className="pt-2"
                    title="Claim funds on Ethereum"
                    description="After your transaction has been validated, you can follow the state of it and claim your funds in the arbitrum bridge page by just connecting your wallet."
                    lastStep
                >
                    {transaction.claimStatus === ClaimStatus.CLAIMABLE &&
                        !fetchingClaimStatus && (
                            <button
                                onClick={onClaim}
                                className={cn("btn btn-primary btn-sm", { "opacity-50": isClaiming, })}
                                disabled={isClaiming}
                            >
                                Claim funds{" "}
                            </button>
                        )}
                </StatusStep>
            </div>
            <div className="bg-gray-200 px-4 py-3">
                <div className="text-sm">
                    Have questions about this process? <a className="link">Learn More</a>
                </div>
            </div>
        </div>
    );
}
