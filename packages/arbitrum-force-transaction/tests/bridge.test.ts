import { BigNumber, providers } from "ethers"
import { ArbitrumBridge } from "../src"
import { ARB_SYS_ADDRESS } from "@arbitrum/sdk/dist/lib/dataEntities/constants";
import { ClaimStatus } from "../src/lib/bridge";
import { resetHardhatForkAll } from "./utils/hardhat-reset";
import { config } from "./utils/config";

describe("bridge", () => {
    let bridge: ArbitrumBridge;
    let l1Provider: providers.Provider;
    let l2Provider: providers.Provider;
    let fromAddress: string; // testing wallet address
    let fromPrivateKey: string; // testing wallet private key

    beforeEach(async () => {
        l1Provider = new providers.JsonRpcProvider(config.L1_RPC)
        l2Provider = new providers.JsonRpcProvider(config.L2_RPC)
        bridge = new ArbitrumBridge(l1Provider, l2Provider)
        fromAddress = config.FROM_ADDRESS
        fromPrivateKey = config.FROM_PRIVATE_KEY
    })

    describe("assembleWithdrawal", () => {
        it("assembleWithdrawal should create a withdrawal transaction", async () => {
            // arrange
            const tx = await bridge.assembleWithdraw(fromAddress, BigNumber.from(1))

            // assert
            expect(tx).toBeDefined()
            expect(tx.value).toBe('1')
            expect(tx.to).toBe(ARB_SYS_ADDRESS)
        })
    })

    describe("getClaimStatus", () => {
        xit("getClaimStatus should return CLAIMED if funds have already been claimed", async () => {
            // arrange 
            const canWithdraw = await bridge.getClaimStatus("")

            // assert
            expect(canWithdraw).toBe(ClaimStatus.CLAIMED)
        })

        
        xit("getClaimStatus should return CLAIMABLE if funds can be claimed", async () => {
            // TODO: figure out how to get a claimable tx here
        })

        xit("getClaimStatus should return PENDING if funds can't be claimed", async () => {
            // TODO: figure out how to get a claimable tx here
        })
    })

    describe("claim", () => {
        beforeEach(() => {
            
        })

        xit("claim should create and send l1 tx to claim the funds after the bridge", () => {
            // TODO: take 
         })
    })
})