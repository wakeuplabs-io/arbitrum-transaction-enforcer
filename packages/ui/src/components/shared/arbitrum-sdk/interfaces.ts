import BigNumber from "bignumber.js";
import { Address, Filter } from "viem";

export interface Network {
  chainID: number;
  name: string;
  explorerUrl: string;
  gif?: string;
  isCustom: boolean;
  /**
   * Minimum possible block time for the chain (in seconds).
   */
  blockTime: number;
  /**
   * Chain ids of children chains, i.e. chains that settle to this chain.
   */
  partnerChainIDs: number[];
}

/**
 * Represents an L1 chain, e.g. Ethereum Mainnet or Sepolia.
 */
export interface L1Network extends Network {
  isArbitrum: false;
}

/**
 * Represents an Arbitrum chain, e.g. Arbitrum One, Arbitrum Sepolia, or an L3 chain.
 */
export interface L2Network extends Network {
  tokenBridge: TokenBridge;
  ethBridge: EthBridge;
  teleporter?: Teleporter;
  /**
   * Chain id of the parent chain, i.e. the chain on which this chain settles to.
   */
  partnerChainID: number;
  isArbitrum: true;
  confirmPeriodBlocks: number;
  retryableLifetimeSeconds: number;
  nitroGenesisBlock: number;
  nitroGenesisL1Block: number;
  /**
   * How long to wait (ms) for a deposit to arrive on l2 before timing out a request
   */
  depositTimeout: number;
  /**
   * In case of a chain that uses ETH as its native/gas token, this is either `undefined` or the zero address
   *
   * In case of a chain that uses an ERC-20 token from the parent chain as its native/gas token, this is the address of said token on the parent chain
   */
  nativeToken?: string;
  /**
   * Has the network been upgraded to bold. True if yes, otherwise undefined
   * This is a temporary property and will be removed in future if Bold is widely adopted and
   * the legacy challenge protocol is deprecated
   */
  isBold?: boolean;
}

export interface Teleporter {
  l1Teleporter: string;
  l2ForwarderFactory: string;
}

export interface TokenBridge {
  l1GatewayRouter: string;
  l2GatewayRouter: string;
  l1ERC20Gateway: string;
  l2ERC20Gateway: string;
  l1CustomGateway: string;
  l2CustomGateway: string;
  l1WethGateway: string;
  l2WethGateway: string;
  l2Weth: string;
  l1Weth: string;
  l1ProxyAdmin: string;
  l2ProxyAdmin: string;
  l1MultiCall: string;
  l2Multicall: string;
}

export interface EthBridge {
  bridge: Address;
  inbox: Address;
  sequencerInbox: Address;
  outbox: string;
  rollup: string;
  classicOutboxes?: {
    [addr: string]: number;
  };
}

export interface L1Networks {
  [id: string]: L1Network;
}

export interface L2Networks {
  [id: string]: L2Network;
}

export interface Networks {
  [id: string]: L1Network | L2Network;
}

export type FetchedEvent<TEvent extends Event> = {
  event: EventArgs<TEvent>;
  topic: string;
  name: string;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  address: string;
  topics: string[];
  data: string;
};
export interface TypedEvent<
  TArgsArray extends Array<any> = any,
  TArgsObject = any,
> extends Event {
  args: TArgsArray & TArgsObject;
}

export type EventArgs<T> =
  T extends TypedEvent<infer _, infer TObj> ? TObj : never;
export type MessageDeliveredEvent = TypedEvent<
  [BigNumber, string, string, number, string, string, BigNumber, BigNumber],
  {
    messageIndex: BigNumber;
    beforeInboxAcc: string;
    inbox: string;
    kind: number;
    sender: string;
    messageDataHash: string;
    baseFeeL1: BigNumber;
    timestamp: BigNumber;
  }
>;
export type ForceInclusionParams = FetchedEvent<MessageDeliveredEvent> & {
  delayedAcc: string;
};

export type BytesLike = Bytes | string;
export type Bytes = ArrayLike<number>;
export type AccessList = Array<{ address: string; storageKeys: Array<string> }>;

export type AccessListish =
  | AccessList
  | Array<[string, Array<string>]>
  | Record<string, Array<string>>;

export interface Overrides {
  gasLimit?: bigint | Promise<bigint>;
  gasPrice?: bigint | Promise<bigint>;
  maxFeePerGas?: bigint | Promise<bigint>;
  maxPriorityFeePerGas?: bigint | Promise<bigint>;
  nonce?: bigint | Promise<bigint>;
  type?: number;
  accessList?: AccessListish;
  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
}

export interface TypedEvent<
  TArgsArray extends Array<any> = any,
  TArgsObject = any
> extends Event {
  args: TArgsArray & TArgsObject;
}

export interface TypedEventFilter<_TEvent extends TypedEvent>
  extends Filter {}
