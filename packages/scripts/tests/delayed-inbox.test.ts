import { describe, it } from "node:test";

describe("Arbitrum delayed inbox", () => {
    it.todo("signChildTransaction should take a random tx and prepare it for sending through delayedInbox")

    it.todo("sendChildTransaction should take tx and deliver it to the delayed inbox")

    it.todo("canForceInclude should return false if not enough time has past")

    it.todo("canForceInclude should return false if the particular signer has no messages in delayed inbox")

    it.todo("canForceInclude should return true if enough time past by")

    it.todo("forceInclude should fail if there're no transactions to force through")

    it.todo("forceInclude should force a tx in l1 if it was pending")
})