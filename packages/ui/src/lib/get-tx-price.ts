import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { EstimateGasParameters } from "wagmi/actions";
import {
  getPublicL1HttpsClient,
  getPublicL2HttpsClient,
} from "./public-client";

interface ITx {
  to: `0x${string}`;
  data: `0x${string}`;
}

//todo: to should be depend on mainnet/sepolia
export const MockL1SendL2MessageTx: ITx = {
  to: "0xaAe29B0366299461418F5324a79Afc425BE5ae21",
  data: "0xb75436bb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002104c36d4653231062d414b13589c398617e80548a539073feb0d0cb3ec7bb39b35500000000000000000000000000000000000000000000000000000000000000",
};
export const MockL2WithdrawTx: ITx = {
  to: "0x0000000000000000000000000000000000000064",
  data: "0x25e1606300000000000000000000000044cda3f339444f2fd5c34783c0d0d487e5dc0f27",
};
export const L1ClaimTxGasLimit = BigNumber.from(111016);

export async function getL1TxPriceFromGasLimit(gasLimit: BigNumber) {
  const ethClient = getPublicL1HttpsClient();
  const gasPrice = await ethClient.getGasPrice().then((x) => BigNumber.from(x));
  const L1BaseFee = parseUnits("1500000000", "wei");
  const L1TxPrice = formatEther(
    BigNumber.from(gasLimit).mul(gasPrice.add(L1BaseFee))
  );

  return L1TxPrice;
}
export async function getL1TxPrice(tx: EstimateGasParameters) {
  const ethClient = getPublicL1HttpsClient();
  const gasPrice = await ethClient.getGasPrice().then((x) => BigNumber.from(x));
  const estimated = await ethClient.estimateGas(tx);
  const L1BaseFee = parseUnits("1500000000", "wei");
  const L1TxPrice = formatEther(
    BigNumber.from(estimated).mul(gasPrice.add(L1BaseFee))
  );

  return L1TxPrice;
}

export async function getL2TxPrice(tx: EstimateGasParameters) {
  const arbClient = getPublicL2HttpsClient();
  const gasPrice = await arbClient.getGasPrice().then((x) => BigNumber.from(x));
  const estimated = await arbClient.estimateGas({ ...tx });
  const L2TxPrice = formatEther(BigNumber.from(estimated).mul(gasPrice));

  return L2TxPrice;
}
