import "dotenv/config"
import axios from 'axios'

const mineBlockAt = async (rpc: string, timestamp: number) => {
  if (!rpc.includes("localhost") && !rpc.includes("127.0.0.1")) {
    throw new Error("mineBlockAt only works with localhost")
  }

  let data = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "evm_mine",
    "params": [timestamp],
    "id": 1
  });

  return axios.request({
    method: 'post',
    maxBodyLength: Infinity,
    url: rpc,
    headers: {'Content-Type': 'application/json'},
    data: data
  })
}

export const hardhatMineBlocks = async (
  rpc: string,
  count: number,
  startTimestamp?: number,
  timeDiffPerBlock = 14
) => {
  let timestamp = startTimestamp
  for (let i = 0; i < count; i++) {
    timestamp = Math.max(
      Math.floor(Date.now() / 1000) + (timeDiffPerBlock || 1),
      (timestamp || 0) + (timeDiffPerBlock || 1)
    )
    await mineBlockAt(rpc, timestamp)
  }
}

// const rpc = process.env.L1RPC as string
// mineBlocks(rpc, 6600, 1722348025)
