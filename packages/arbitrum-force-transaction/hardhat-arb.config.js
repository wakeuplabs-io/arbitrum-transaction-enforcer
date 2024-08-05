require("dotenv/config")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 421614,
      blockGasLimit: 200000000,
      forking: {
        url: process.env.ARB_SEPOLIA_RPC,
        blockNumber: 67721640
      },
    },
  }
};
