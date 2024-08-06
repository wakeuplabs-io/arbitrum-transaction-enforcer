import "dotenv/config"
import { ethers, Wallet } from "ethers";
import { ArbitrumDelayedInbox } from "arbitrum-force-transaction";

const walletPrivateKey = process.env.DEVNET_PRIVKEY as string

const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1RPC)
const l2Provider = new ethers.providers.JsonRpcProvider(process.env.L2RPC)

const l1Wallet = new Wallet( walletPrivateKey, l1Provider)
const l2Wallet = new Wallet(walletPrivateKey, l2Provider)

const arbDelayedInbox = new ArbitrumDelayedInbox(421614)

const l2CounterContractAddress = "0x362698Add3e652B9422Ac669d4e228608C6cFecd"

async function readCount() {
    console.log("here")
    const contract = new ethers.Contract(l2CounterContractAddress, ["function count() view returns (uint256)"], l2Provider);
    console.log(await contract.count())
}

async function incrementCount() {
    const contract = new ethers.Contract(l2CounterContractAddress, ["function increment() public"], l2Wallet);
    console.log(await contract.increment())
}

async function incrementCountWithDelayed() {
    const contract = new ethers.utils.Interface(["function increment() public"]);
   
    const l2SignedTx = await arbDelayedInbox.signChildTransaction(l2Wallet, {
        to: l2CounterContractAddress,
        data: await contract.encodeFunctionData("increment"),
    })
    const l1DelayedInboxTx = await arbDelayedInbox.sendChildTransaction(l1Wallet, l2SignedTx);

    return l1DelayedInboxTx;
}

// =========================================================================
// Force include a random transaction ======================================
// =========================================================================

// get current contract count, to check if it's incremented after
// readCount()

// increment the count without delayed inbox
// incrementCount()

// increment count with delayed inbox
incrementCountWithDelayed().then(console.log)