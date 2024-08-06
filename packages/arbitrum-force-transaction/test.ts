import { resetHardhatFork } from "./tests/utils/hardhat-reset";

resetHardhatFork("http://127.0.0.1:4001/", {
    "jsonRpcUrl": "https://arb-sepolia.g.alchemy.com/v2/5C8sXg_t7pTYBkNaGtPhtyJ6VLtfX-Hj",
    "blockNumber": 67721640
}).then(() => console.log("OK"))
