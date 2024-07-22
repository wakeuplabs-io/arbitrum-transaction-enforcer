import BigNumber from "bignumber.js";
import { getPublicHttpsClient, getWalletHttpsClient } from "../viemClients";
import { Bridge__factory } from "./Bridge__factory";
import { getL2Network } from "./networks";
import { SequencerInbox__factory } from "./SequencerInbox__factory";
import { inboxAbi, sequencerInboxAbi } from "./abis/abis";
import {
  Bytes,
  FetchedEvent,
  ForceInclusionParams,
  L2Network,
  MessageDeliveredEvent,
  Overrides,
} from "./interfaces";
import { getHttpRpcClient } from "viem/utils";
import { Address, Block } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";
import BridgeService from "./contract-services/bridge/bridge";
import InboxService from "./contract-services/inbox/Inbox";
import SequencerInboxService from "./contract-services/sequencer-inbox/SequencerInbox";

export default async function forceInclude() {
  const { address: clientAddress, chainId } = useAccount();
  if (!clientAddress || !chainId) return;

  const { l2Network, bridge, sequencerInbox, inbox } = await setup(
    clientAddress,
    chainId
  );
  //might not need sequencerInbox
  inbox.sendUnsignedTransaction({
    to: clientAddress,
    value: BigInt(0),
    gasLimit: BigInt(100000),
    maxFeePerGas: BigInt(21000000000),
    nonce: BigInt(0),
  });

  // const forceInclusionTx = await inboxTools.forceInclude(); //A reimplementar
  const forceInclusionTx = await myForceInclude(l2Network);

  const messagesReadAfter = await sequencerInbox.totalDelayedMessagesRead();
}

async function setup(clientAddress: Address, chainId: number) {
  const arbitrumOne = await getL2Network(chainId);

  const bridge = new BridgeService(clientAddress, arbitrumOne.ethBridge.bridge);
  const inbox = new InboxService(clientAddress, arbitrumOne.ethBridge.inbox);
  const sequencerInbox = new SequencerInboxService(
    clientAddress,
    arbitrumOne.ethBridge.sequencerInbox
  );

  return {
    clientAddress,
    l2Network: arbitrumOne,
    sequencerInbox,
    bridge,
    inbox,
  };
}

async function myForceInclude<T extends ForceInclusionParams | undefined>(
  l2Network: L2Network,
  messageDeliveredEvent?: T,
  overrides?: Overrides
) {
  const eventInfo =
    messageDeliveredEvent || (await getForceIncludableEvent(l2Network));

  if (!eventInfo) return null;
  const block = await l1Provider.getBlock(eventInfo.blockHash);

  const result = getPublicHttpsClient().readContract({
    address: `0x${l2Network.ethBridge.sequencerInbox}`,
    abi: sequencerInboxAbi,
    args: [
      eventInfo.event.messageIndex.plus(1),
      eventInfo.event.kind,
      [eventInfo.blockNumber, block.timestamp],
      eventInfo.event.baseFeeL1,
      eventInfo.event.sender,
      eventInfo.event.messageDataHash,
      // we need to pass in {} because if overrides is undefined it thinks we've provided too many params
      overrides || {},
    ],
    functionName: "forceInclusion",
  });
  return await result;
}

async function isArbitrumChain(chainId: number): Promise<boolean> {
  try {
    const ARB_SYS_ADDRESS = "0x0000000000000000000000000000000000000064";

    await ArbSys__factory.connect(ARB_SYS_ADDRESS, chainId).arbOSVersion();
  } catch (error) {
    return false;
  }
  return true;
}

async function findFirstBlockBelow(
  blockNumber: BigInt,
  blockTimestamp: BigInt
): Promise<Block> {
  const isParentChainArbitrum = await isArbitrumChain(this.l1Provider);

  if (isParentChainArbitrum) {
    const nodeInterface = NodeInterface__factory.connect(
      NODE_INTERFACE_ADDRESS,
      this.l1Provider
    );

    try {
      blockNumber = (
        await nodeInterface.l2BlockRangeForL1(blockNumber - 1)
      ).firstBlock.toNumber();
    } catch (e) {
      // l2BlockRangeForL1 reverts if no L2 block exist with the given L1 block number,
      // since l1 block is updated in batch sometimes block can be skipped even when there are activities
      // alternatively we use binary search to get the nearest block
      const _blockNum = (
        await getBlockRangesForL1Block({
          provider: this.l1Provider as JsonRpcProvider,
          forL1Block: blockNumber - 1,
          allowGreater: true,
        })
      )[0];

      if (!_blockNum) {
        throw e;
      }

      blockNumber = _blockNum;
    }
  }

  const block = await getPublicHttpsClient().getBlock({ blockNumber });
  const diff = block.timestamp - blockTimestamp;
  if (diff < 0) return block;

  // we take a long average block time of 12s
  // and always move at least 10 blocks
  const diffBlocks = Math.max(Math.ceil(diff / 12), 10);

  return await this.findFirstBlockBelow(
    blockNumber - diffBlocks,
    blockTimestamp
  );
}

async function getForceIncludableBlockRange(
  l2Network: L2Network,
  blockNumberRangeSize: number
) {
  let currentL1BlockNumber: number | undefined;

  const result = getPublicHttpsClient().readContract({
    address: `0x${l2Network.ethBridge.sequencerInbox}`,
    abi: sequencerInboxAbi,
    args: [],
    functionName: "forceInclusion",
  });
  const walletClient = getWalletHttpsClient();

  const isParentChainArbitrum = await isArbitrumChain(walletClient.chain);

  if (isParentChainArbitrum) {
    const arbProvider = new ArbitrumProvider(
      this.l1Provider as JsonRpcProvider
    );
    const currentArbBlock = await arbProvider.getBlock("latest");
    currentL1BlockNumber = currentArbBlock.l1BlockNumber;
  }

  const multicall = await MultiCaller.fromProvider(this.l1Provider);
  const multicallInput: [
    CallInput<Awaited<ReturnType<SequencerInbox["maxTimeVariation"]>>>,
    ReturnType<MultiCaller["getBlockNumberInput"]>,
    ReturnType<MultiCaller["getCurrentBlockTimestampInput"]>,
  ] = [
    {
      targetAddr: sequencerInbox.address,
      encoder: () =>
        sequencerInbox.interface.encodeFunctionData("maxTimeVariation"),
      decoder: (returnData: string) =>
        sequencerInbox.interface.decodeFunctionResult(
          "maxTimeVariation",
          returnData
        )[0],
    },
    multicall.getBlockNumberInput(),
    multicall.getCurrentBlockTimestampInput(),
  ];

  const [maxTimeVariation, currentBlockNumber, currentBlockTimestamp] =
    await multicall.multiCall(multicallInput, true);

  const blockNumber = isParentChainArbitrum
    ? currentL1BlockNumber!
    : currentBlockNumber.toNumber();

  const firstEligibleBlockNumber =
    blockNumber - maxTimeVariation.delayBlocks.toNumber();
  const firstEligibleTimestamp =
    currentBlockTimestamp.toNumber() - maxTimeVariation.delaySeconds.toNumber();

  const firstEligibleBlock = await findFirstBlockBelow(
    firstEligibleBlockNumber,
    firstEligibleTimestamp
  );

  return {
    endBlock: firstEligibleBlock.number,
    startBlock: firstEligibleBlock.number - blockNumberRangeSize,
  };
}

async function getForceIncludableEvent(
  l2Network: L2Network,
  maxSearchRangeBlocks: number = 3 * 6545,
  startSearchRangeBlocks = 100,
  rangeMultipler = 2
): Promise<ForceInclusionParams | null> {
  // events dont become eligible until they pass a delay
  // find a block range which will emit eligible events
  const events = await getEventsAndIncreaseRange(
    startSearchRangeBlocks,
    maxSearchRangeBlocks,
    rangeMultipler
  );

  // no events appeared within that time period
  if (events.length === 0) return null;

  // take the last event - as including this one will include all previous events
  const eventInfo = events[events.length - 1];
  // has the sequencer inbox already read this latest message

  // const totalDelayedRead = await sequencerInbox.totalDelayedMessagesRead();
  const totalDelayedRead = await getPublicHttpsClient().readContract({
    address: `0x${l2Network.ethBridge.sequencerInbox}`,
    abi: sequencerInboxAbi,
    args: [],
    functionName: "totalDelayedMessagesRead",
  });
  if (totalDelayedRead.gt(eventInfo.event.messageIndex)) {
    // nothing to read - more delayed messages have been read than this current index
    return null;
  }

  const delayedAcc = await getPublicHttpsClient().readContract({
    address: `0x${l2Network.ethBridge.bridge}`,
    abi: sequencerInboxAbi,
    args: [eventInfo.event.messageIndex],
    functionName: "delayedInboxAccs",
  });

  return { ...eventInfo, delayedAcc: delayedAcc };
}
/**
 * Look for force includable events in the search range blocks, if no events are found the search range is
 * increased incrementally up to the max search range blocks.
 * @param bridge
 * @param searchRangeBlocks
 * @param maxSearchRangeBlocks
 * @returns
 */
async function getEventsAndIncreaseRange(
  bridge: BridgeService,
  searchRangeBlocks: number,
  maxSearchRangeBlocks: number,
  rangeMultiplier: number
): Promise<FetchedEvent<MessageDeliveredEvent>[]> {
  const eFetcher = new EventFetcher(this.l1Provider);

  // events don't become eligible until they pass a delay
  // find a block range which will emit eligible events
  const cappedSearchRangeBlocks = Math.min(
    searchRangeBlocks,
    maxSearchRangeBlocks
  );
  const blockRange = await getForceIncludableBlockRange(
    cappedSearchRangeBlocks
  );

  // get all the events in this range
  const events = await eFetcher.getEvents(
    Bridge__factory,
    (b) => b.filters.MessageDelivered(),
    {
      fromBlock: blockRange.startBlock,
      toBlock: blockRange.endBlock,
      address: bridge.address,
    }
  );

  if (events.length !== 0) return events;
  else if (cappedSearchRangeBlocks === maxSearchRangeBlocks) return [];
  else {
    return await getEventsAndIncreaseRange(
      bridge,
      searchRangeBlocks * rangeMultiplier,
      maxSearchRangeBlocks,
      rangeMultiplier
    );
  }
}
