import { TransactionStatus } from "@/components/transaction/status";
import { transactionsStorageService } from "@/lib/transactions";
import {
  ErrorComponent,
  createFileRoute,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import cn from "classnames";
import { Bell, CircleCheck } from 'lucide-react';
import { Address, formatEther } from "viem";

export const Route = createFileRoute("/activity/$tx")({
  loader: async ({ params }) => {
    const tx = transactionsStorageService.getByBridgeHash((params.tx as Address) ?? "0x");
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
  const tx = Route.useLoaderData();
  const navigate = useNavigate();


  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="flex flex-col items-center">
        <CircleCheck size={48} color="#22C55E" />
        <div className="text-4xl font-semibold mb-6">Hey! Great Job!</div>
        <div className="md:text-xl">
          Your withdrawal request for{" "}
          <b className="font-semibold">
            {formatEther(BigInt(tx.amount))}
          </b>{" "}
          ETH from <b className="font-semibold">Arbitrum</b> to{" "}
          <b className="font-semibold">Ethereum</b> has been successfully
          initiated
        </div>
      </div>

      {/* Steps */}
      <TransactionStatus tx={tx} isActive={true}
      />
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
    </div >
  );
}