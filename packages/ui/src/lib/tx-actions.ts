import { Address } from "viem";
import { getPublicL1HttpsClient } from "./public-client";

export async function getL1BlockTimestamp(txHash: Address) {
  const ethClient = getPublicL1HttpsClient();

  const blockTimestamp = await ethClient
    .getTransaction({ hash: txHash })
    .then((tx) =>
      ethClient
        .getBlock({ blockNumber: tx.blockNumber })
        .then((x) => Number(x.timestamp) * 1000)
    );

  return blockTimestamp;
}
