import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export async function getL1BlockTimestamp(txHash: `0x${string}`) {
  const ethClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const blockTimestamp = await ethClient
    .getTransaction({ hash: txHash })
    .then((tx) =>
      ethClient
        .getBlock({ blockNumber: tx.blockNumber })
        .then((x) => Number(x.timestamp) * 1000)
    );

  return blockTimestamp;
}
