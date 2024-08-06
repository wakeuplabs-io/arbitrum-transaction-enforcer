require("dotenv/config")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 11155111, // sepolia
      blockGasLimit: 200000000,
      forking: {
        url: process.env.FORK_L1_RPC,
        blockNumber: 6403950
      },
    },
  }
};
