import "dotenv/config"
import { BigNumber, providers, Wallet } from 'ethers'
import { ArbitrumDelayedInbox } from "../src/lib/delayed-inbox"
import { ArbitrumBridge } from "../src/lib/bridge"

if (!process.env.DEVNET_PRIVKEY) {
    throw new Error('DEVNET_PRIVKEY env variable is required')
} else if (!process.env.L2RPC) {
    throw new Error('L2RPC env variable is required')
} else if (!process.env.L1RPC) {
    throw new Error('L1RPC env variable is required')
}

const walletPrivateKey = process.env.DEVNET_PRIVKEY as string

const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC)
const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC)

const l1Wallet = new Wallet(walletPrivateKey, l1Provider)
const l2Wallet = new Wallet(walletPrivateKey, l2Provider)

const amountInWei = 1

const arbDelayedInbox = new ArbitrumDelayedInbox(421614)
const arbBridge = new ArbitrumBridge(l1Provider, l2Provider)

async function initiateWithdraw() {
    const bridgeTx = await arbBridge.assembleWithdraw(l2Wallet.address, BigNumber.from(amountInWei))
    
    const signedTx = await arbDelayedInbox.signChildTransaction(l2Wallet, bridgeTx)
    const delayedInboxTx = await arbDelayedInbox.sendChildTransaction(l1Wallet, signedTx)

    return delayedInboxTx
}

// =========================================================================
// Bridge tests ============================================================
// =========================================================================

// Uncomment to run each test

// Initiates a withdraw of funds through the delayed inbox. Make sure to make note on the l2Hash for later
// initiateWithdraw().then(console.log)

// If the sequencer didn't take our tx for 24 hours, this should be true
// isForceIncludePossible(l1Wallet, l2Wallet).then(console.log)

// If the sequencer didn't take our tx for 24 hours, we can run this to force include it
// forceInclude(l1Wallet, l2Wallet).then(console.log)

// Discover if we can already claim the funds
// const l2Hash = "0xba46de8a236f34ee520aa920384d4222046858dc62bbc7e99f75854e89454770"
// getClaimStatus(l2Hash, l1Wallet, l2Provider).then(console.log)

// Claim the funds
// claimFunds(l2Hash, l1Wallet, l2Provider).then(console.log)
