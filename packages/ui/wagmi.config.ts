import { defineConfig } from "@wagmi/cli";

import { Abi } from "viem";
import inboxAbi from "./src/components/shared/arbitrum-sdk/contract-services/inbox/inbox.abi.json";
import sequencerInboxAbi from "./src/components/shared/arbitrum-sdk/contract-services/sequencer-inbox/sequencerInbox.abi.json";
import bridgeAbi from "./src/components/shared/arbitrum-sdk/contract-services/bridge/bridge.abi.json";

export default defineConfig({
  out: "src/components/shared/arbitrum-sdk/abis/abis.ts",
  contracts: [
    {
      name: "bridge",
      abi: bridgeAbi as Abi,
    },
    {
      name: "inbox",
      abi: inboxAbi as Abi,
    },
    {
      name: "sequencerInbox",
      abi: sequencerInboxAbi as Abi,
    },
  ],
  plugins: [],
});
