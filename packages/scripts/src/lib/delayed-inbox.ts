import { ethers } from 'ethers'
import { getArbitrumNetwork } from '@arbitrum/sdk/dist/lib/dataEntities/networks'
import { InboxTools } from '@arbitrum/sdk'

export class ArbitrumDelayedInbox {
    constructor(private readonly childChainId: number) {}

    async signChildTransaction(l2Signer: ethers.Signer, tx: any): Promise<string> {
        const l2Network = await getArbitrumNetwork(this.childChainId)
        const inboxSdk = new InboxTools(l2Signer, l2Network)
    
        // extract l2's tx hash first so we can check if this tx executed on l2 later.
        const l2SignedTx = await inboxSdk.signChildTx(tx, l2Signer)
        const hash = ethers.utils.parseTransaction(l2SignedTx).hash 
        if (!hash) {
            throw new Error("Error signing child transaction")
        }
        return hash
    }

    async sendChildTransaction(l1Signer: ethers.Signer, l2SignedTx: string): Promise<string> {
        const l2Network = await getArbitrumNetwork(this.childChainId)
        const inboxSdk = new InboxTools(l1Signer, l2Network)

        const resultsL1 = await inboxSdk.sendChildSignedTx(l2SignedTx)
        if (resultsL1 == null) {
            throw new Error(`Failed to send tx to l1 delayed inbox!`)
        }
        return resultsL1.hash;
    }

    async canForceInclude(l1Signer: ethers.Signer) {
        const l2Network = getArbitrumNetwork(this.childChainId);
        const inboxSdk = new InboxTools(l1Signer, l2Network);
    
        return !!(await inboxSdk.getForceIncludableEvent());
    }

    async forceInclude(l1Signer: ethers.Signer): Promise<ethers.ContractReceipt | null> {
        const l2Network = getArbitrumNetwork(this.childChainId);
        const inboxTools = new InboxTools(l1Signer, l2Network);
    
        const forceInclusionTx = await inboxTools.forceInclude();
    
        if (forceInclusionTx) {
            return await forceInclusionTx.wait();
        } else return null;
    }
}