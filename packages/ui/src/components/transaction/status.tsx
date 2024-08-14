import { useWeb3ClientContext } from "@/contexts/web3-client-context";
import useArbitrumBridge, { ClaimStatus } from "@/hooks/useArbitrumBridge";
import useOnScreen from "@/hooks/useOnScreen";
import { Transaction, transactionsStorageService } from "@/lib/transactions";
import { getTimestampFromTxHash } from "@/lib/tx-actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import cn from "classnames";
import { addDays, addHours, intervalToDuration } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Address } from "viem";
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
    const [transaction, setTransaction] = useState<Transaction>(props.tx);
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);
    const { publicParentClient, parentProvider, childProvider } = useWeb3ClientContext();


    const forceIncludeTx = useMutation({
        mutationFn: forceInclude,
        onError: (e) =>
            window.alert("Something went wrong, please try again. " + e.message),
    });

    const confirmTx = useMutation({
        mutationFn: pushChildTxToParent,
        onError: (e) =>
            window.alert("Something went wrong, please try again. " + e.message),
    });

    const claimFundsTx = useMutation({
        mutationFn: claimFunds,
        onError: (e) =>
            window.alert("Something went wrong, please try again. " + e.message),
    });

    const { data: claimStatusData, isFetching: fetchingClaimStatus } = useQuery({
        queryKey: ["claimStatus", transaction.bridgeHash],
        queryFn: () => getClaimStatus(transaction.bridgeHash!, childProvider, parentProvider),
        enabled:
            isVisible &&
            !!transaction.delayedInboxTimestamp &&
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

    const { data: delayedInboxTxTimestamp, isFetching: fetchingInboxTxTimestamp } =
        useQuery({
            queryKey: ["delayedInboxTimestamp", transaction.delayedInboxHash],
            queryFn: () => getTimestampFromTxHash(transaction.delayedInboxHash!, publicParentClient),
            enabled: isVisible && transaction.delayedInboxHash && !transaction.delayedInboxTimestamp,
        });

    function recalculateRemainingHours(timestamp: number) {
        const dueDate = addDays(timestamp, 1);
        const remainingHours = intervalToDuration({
            start: Date.now(),
            end: dueDate,
        }).hours;

        setRemainingHours((!remainingHours || remainingHours < 0) ? 0 : remainingHours);
    }

    function updateTx(updatedTx: Transaction) {
        setTransaction(updatedTx);
        transactionsStorageService.update(updatedTx);
    }

    function onConfirm() {
        if (!signer) return;

        confirmTx.mutate({
            l2SignedTx: transaction.bridgeHash,
            parentSigner: signer,
        }, {
            onSuccess: (inboxTx) => {
                let updatedTx = {
                    ...transaction,
                    delayedInboxHash: inboxTx.hash as Address
                };
                updateTx(updatedTx);
                inboxTx.wait().then(() => updateTx({
                    ...updatedTx,
                    delayedInboxTimestamp: Date.now()
                }));
            },
        });
    }

    function onForce() {
        if (!signer) return;

        forceIncludeTx.mutate(signer);
    }

    function onClaim() {
        if (!signer) return;

        claimFundsTx.mutate({
            l2TxnHash: transaction.bridgeHash,
            parentSigner: signer,
            childProvider
        }, {
            onSuccess: () => {
                updateTx({
                    ...transaction,
                    claimStatus: ClaimStatus.CLAIMED,
                });
            },
        });
    }

    useEffect(() => {
        if (transaction.delayedInboxTimestamp)
            recalculateRemainingHours(transaction.delayedInboxTimestamp);
        else if (delayedInboxTxTimestamp)
            updateTx({ ...transaction, delayedInboxTimestamp: delayedInboxTxTimestamp });
    }, [delayedInboxTxTimestamp, transaction.delayedInboxTimestamp]);

    useEffect(() => {
        if (claimStatusData && claimStatusData !== ClaimStatus.PENDING)
            updateTx({ ...transaction, claimStatus: claimStatusData });
    }, [claimStatusData]);

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
                    done={!!transaction.delayedInboxTimestamp}
                    active={!transaction.delayedInboxHash || !transaction.delayedInboxTimestamp}
                    running={(confirmTx.isPending || fetchingInboxTxTimestamp) && !transaction.delayedInboxTimestamp}
                    number={2}
                    title="Confirm Withdraw"
                    description="Send the Arbitrum withdraw transaction through the delayed inbox"
                    className="pt-2 space-y-2 md:space-y-0 md:space-x-2 mb-4 flex items-start flex-col md:flex-row md:items-center"
                >
                    {!transaction.delayedInboxHash && !transaction.delayedInboxTimestamp && !fetchingInboxTxTimestamp && (
                        <button
                            onClick={onConfirm}
                            className={cn("btn btn-primary btn-sm", {
                                "opacity-50": confirmTx.isPending,
                            })}
                            disabled={confirmTx.isPending}
                        >
                            Confirm
                        </button>
                    )}
                    {transaction.delayedInboxHash && (
                        <a
                            href={`https://sepolia.etherscan.io/tx/${transaction.delayedInboxHash}`}
                            target="_blank"
                            className="link text-sm flex space-x-1 items-center "
                        >
                            <span>Ethereum delayed inbox tx </span>
                            <ArrowUpRight className="h-3 w-3" />
                        </a>
                    )}
                </StatusStep>
                <StatusStep
                    done={
                        [ClaimStatus.CLAIMED, ClaimStatus.CLAIMABLE].includes(
                            transaction.claimStatus
                        ) && !fetchingClaimStatus
                    }
                    active={
                        !!transaction.delayedInboxTimestamp &&
                        transaction.claimStatus === ClaimStatus.PENDING &&
                        !fetchingClaimStatus
                    }
                    running={forceIncludeTx.isPending || fetchingForceIncludeStatus}
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
                        transaction.delayedInboxTimestamp &&
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
                                        startDate: addHours(transaction.delayedInboxTimestamp, 24),
                                        endDate: addHours(transaction.delayedInboxTimestamp, 25),
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
                    running={claimFundsTx.isPending || fetchingClaimStatus}
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
                                className={cn("btn btn-primary btn-sm", {
                                    "opacity-50": claimFundsTx.isPending,
                                })}
                                disabled={claimFundsTx.isPending}
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
