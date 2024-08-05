import "dotenv/config"
import { BigNumber, ethers, providers } from 'ethers'
import {
    ChildTransactionReceipt,
    ChildToParentMessageStatus,
} from '@arbitrum/sdk'
import { ArbSys__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ArbSys__factory'
import { ARB_SYS_ADDRESS } from '@arbitrum/sdk/dist/lib/dataEntities/constants'

export enum ClaimStatus {
    PENDING = 'PENDING',
    CLAIMABLE = 'CLAIMABLE',
    CLAIMED = 'CLAIMED',
}

export class ArbitrumBridge {

    constructor(private readonly l1Provider: providers.Provider, private readonly l2Provider: providers.Provider) { }

    // Assemble a generic withdraw transaction
    async assembleWithdraw(from: string, amount: BigNumber): Promise<{ data: string, to: string, value: string }> {
        const arbSys = ArbSys__factory.connect(ARB_SYS_ADDRESS, this.l2Provider)
        const arbsysIface = arbSys.interface
        const calldatal2 = arbsysIface.encodeFunctionData('withdrawEth', [from])

        return {
            data: calldatal2,
            to: ARB_SYS_ADDRESS,
            value: amount.toString(),
        }
    }

    async getClaimStatus(txnHash: string): Promise<ClaimStatus> {
        // First, let's find the Arbitrum txn from the txn hash provided
        const receipt = await this.l2Provider.getTransactionReceipt(txnHash)
        if (receipt === null) {
            return ClaimStatus.PENDING;
        }
        const l2Receipt = new ChildTransactionReceipt(receipt)

        // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
        // We assume there's only one / just grad the first one.
        const messages = await l2Receipt.getChildToParentMessages(this.l1Provider)
        const l2ToL1Msg = messages[0]

        // Check if already executed
        if ((await l2ToL1Msg.status(this.l2Provider)) == ChildToParentMessageStatus.EXECUTED) {
            return ClaimStatus.CLAIMED
        }

        // block number of the first block where the message can be executed or null if it already can be executed or has been executed
        const block = await l2ToL1Msg.getFirstExecutableBlock(this.l2Provider)
        if (block === null) {
            return ClaimStatus.CLAIMABLE
        } else {
            return ClaimStatus.PENDING
        }
    }

    async claim(txnHash: string, l1Wallet: ethers.Signer): Promise<string | null> {
        // First, let's find the Arbitrum txn from the txn hash provided
        const receipt = await this.l2Provider.getTransactionReceipt(txnHash);
        const l2Receipt = new ChildTransactionReceipt(receipt);

        // In principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
        // We assume there's only one / just grad the first one.
        const messages = await l2Receipt.getChildToParentMessages(l1Wallet);
        const l2ToL1Msg = messages[0];

        // Check if already executed
        if (
            (await l2ToL1Msg.status(this.l2Provider)) == ChildToParentMessageStatus.EXECUTED
        ) {
            return null;
        }

        // Now that its confirmed and not executed, we can execute our message in its outbox entry.
        const res = await l2ToL1Msg.execute(this.l2Provider);

        return res.hash;
    }

}