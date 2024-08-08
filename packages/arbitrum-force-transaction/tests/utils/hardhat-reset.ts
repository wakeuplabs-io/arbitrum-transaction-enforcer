import "dotenv/config"
import axios from 'axios'
import { config } from "./config"

export const resetHardhatFork = async (rpc: string, forking: {
    jsonRpcUrl: string,
    blockNumber: number
}) => {
    return axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: rpc,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
            "jsonrpc": "2.0",
            "method": "hardhat_reset",
            "params": [{ forking }],
            "id": 1
        })
    })
}

export const resetHardhatForkArb = () => {
    return resetHardhatFork(config.L2_RPC, {
        "jsonRpcUrl": config.FORK_L2_RPC,
        "blockNumber": config.FORK_L2_BLOCKNUMBER
    })
}


export const resetHardhatForkEth = () => {
    return resetHardhatFork(config.L1_RPC, {
        "jsonRpcUrl": config.FORK_L1_RPC,
        "blockNumber": config.FORK_L1_BLOCKNUMBER
    })
}

export const resetHardhatForkAll = () => {
    return Promise.all([resetHardhatForkArb(), resetHardhatForkEth])
}