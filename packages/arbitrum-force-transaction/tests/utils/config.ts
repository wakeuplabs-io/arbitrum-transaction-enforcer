import "dotenv/config"


export const config = {
    // rpcs
    L1_RPC: process.env.L1_RPC as string,
    L2_RPC: process.env.L2_RPC as string,

    // forks
    FORK_L1_RPC: process.env.FORK_L1_RPC as string,
    FORK_L1_BLOCKNUMBER : 6403950,
    FORK_L2_RPC: process.env.FORK_L2_RPC as string,
    FORK_L2_BLOCKNUMBER : 67721640,

    // hardhat wallet
    FROM_ADDRESS: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    FROM_PRIVATE_KEY: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
}