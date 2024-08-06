import { BigNumber, ethers, providers } from "ethers"
import { ArbitrumBridge } from "../src"
import { ARB_SYS_ADDRESS } from "@arbitrum/sdk/dist/lib/dataEntities/constants";
import { ClaimStatus } from "../src/lib/bridge";
import { resetHardhatForkEth } from "./utils/hardhat-reset";
import { config } from "./utils/config";

describe("bridge", () => {
    let bridge: ArbitrumBridge;
    let l1Provider: providers.Provider;
    let l2Provider: providers.Provider;
    let l1Signer: ethers.Wallet;
    let l2Signer: ethers.Wallet;
    let fromAddress: string; // testing wallet address
    let fromPrivateKey: string; // testing wallet private key

    beforeEach(async () => {
        // providers
        l1Provider = new providers.JsonRpcProvider(config.L1_RPC)
        l2Provider = new providers.JsonRpcProvider(config.L2_RPC)

        // bridge
        bridge = new ArbitrumBridge(l1Provider, l2Provider)

        // signers
        fromAddress = config.FROM_ADDRESS
        fromPrivateKey = config.FROM_PRIVATE_KEY
        l1Signer = new ethers.Wallet(fromPrivateKey, l1Provider)
        l2Signer = new ethers.Wallet(fromPrivateKey, l2Provider)
    })

    xdescribe("assembleWithdrawal", () => {
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
            const claimed = "0x" // TODO:
            const canWithdraw = await bridge.getClaimStatus(claimed)

            // assert
            expect(canWithdraw).toBe(ClaimStatus.CLAIMED)
        })


        it("getClaimStatus should return CLAIMABLE if funds can be claimed", async () => {
            const claimable = "0x37916fe7dd84b05e1437b050089989dc49ec010762284486c8bea396f8df2e3a"
            const canWithdraw = await bridge.getClaimStatus(claimable)

            // assert
            expect(canWithdraw).toBe(ClaimStatus.CLAIMABLE)
        })

        xit("getClaimStatus should return PENDING if funds can't be claimed", async () => {
            const pending = "0x" // TODO:
            const canWithdraw = await bridge.getClaimStatus(pending)

            // assert
            expect(canWithdraw).toBe(ClaimStatus.PENDING)
        })
    })

    describe("claim", () => {
        beforeEach(async () => {
            await resetHardhatForkEth()
        })

        xit("claim should create and send l1 tx to claim the funds after the bridge", async () => {
            const claimable = "0x37916fe7dd84b05e1437b050089989dc49ec010762284486c8bea396f8df2e3a"
            const tx = await bridge.claim(claimable, l1Signer)

            // assert
            expect(tx).not.toBe(null)
        })
    })
})