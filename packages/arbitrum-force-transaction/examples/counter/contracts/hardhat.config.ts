import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    arb: {
      url: "...",
      accounts: ["..."]
    }
  }
};

export default config;
