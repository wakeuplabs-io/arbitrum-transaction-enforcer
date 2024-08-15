import { BigNumber, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Address } from "viem";

export interface ITxReq extends ethers.providers.TransactionRequest {
  to: Address;
  data: Address;
  value: bigint;
}

//todo: to should be depend on mainnet/sepolia
export const MockL1SendL2MessageTx: ITxReq = {
  to: "0xaAe29B0366299461418F5324a79Afc425BE5ae21",
  data: "0xb75436bb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002104c36d4653231062d414b13589c398617e80548a539073feb0d0cb3ec7bb39b35500000000000000000000000000000000000000000000000000000000000000",
  value: BigInt(0),
};
export const MockL2WithdrawTx: ITxReq = {
  to: "0x0000000000000000000000000000000000000064",
  data: "0x25e1606300000000000000000000000044cda3f339444f2fd5c34783c0d0d487e5dc0f27",
  value: BigInt(0),
};
export const L1ClaimTxGasLimit = BigNumber.from(111016);

export async function getParentTxPriceFromGasLimit(
  gasLimit: BigNumber,
  parentProvider: ethers.providers.JsonRpcProvider
) {
  const gasPrice = await parentProvider
    .getGasPrice()
    .then((x) => BigNumber.from(x));
  const L1BaseFee = parseUnits("1500000000", "wei");
  const L1TxPrice = BigNumber.from(gasLimit).mul(gasPrice.add(L1BaseFee));

  return L1TxPrice;
}
export async function getL1TxPrice(
  tx: ethers.providers.TransactionRequest,
  parentProvider: ethers.providers.JsonRpcProvider
) {
  const gasPrice = await parentProvider
    .getGasPrice()
    .then((x) => BigNumber.from(x));
  const estimated = await parentProvider.estimateGas(tx);
  const L1BaseFee = parseUnits("1500000000", "wei");
  const L1TxPrice = BigNumber.from(estimated).mul(gasPrice.add(L1BaseFee));

  return L1TxPrice;
}

export async function getChildTxPrice(
  tx: ethers.providers.TransactionRequest,
  childProvider: ethers.providers.JsonRpcProvider
) {
  const gasPrice = await childProvider
    .getGasPrice()
    .then((x) => BigNumber.from(x));
  const estimated = await childProvider.estimateGas(tx);
  const L2TxPrice = BigNumber.from(estimated).mul(gasPrice);

  return L2TxPrice;
}
export async function getMockedL2WithdrawPrice(
  childProvider: ethers.providers.JsonRpcProvider
) {
  return getChildTxPrice(MockL2WithdrawTx, childProvider);
}

export async function getMockedSendL1MsgPrice(
  parentProvider: ethers.providers.JsonRpcProvider
) {
  return getL1TxPrice(MockL1SendL2MessageTx, parentProvider);
}

export async function getMockedL1ClaimTxGasLimit(
  parentProvider: ethers.providers.JsonRpcProvider
) {
  return getParentTxPriceFromGasLimit(L1ClaimTxGasLimit, parentProvider);
}
