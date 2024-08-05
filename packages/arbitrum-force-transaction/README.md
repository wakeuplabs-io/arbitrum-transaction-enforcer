
# Setup

## Patches in node_modules:

Apply fixes from this PR -> https://github.com/OffchainLabs/arbitrum-sdk/pull/520 (There's already patch executed in `postinstall`)

To use `hardhat forks` you need to comment:line 272 within `signChildTx` in `@arbitrum/sdk/dist/lib/inbox/inbox.js`

```
// tx.gasLimit = (await this.estimateArbitrumGas(tx, childSigner.provider)).gasEstimateForChild;
```

## env file

.env example

```bash
# # testnets
# DEVNET_PRIVKEY="0x..."
# L1RPC="https://arb-sepolia...."
# L2RPC="https://eth-sepolia...."

# hardhat
L1RPC="http://127.0.0.1:4000/"
L2RPC="http://127.0.0.1:4001/"
DEVNET_PRIVKEY="0x..."

# For hardhat forks
ARB_SEPOLIA_RPC="https://arb-sepolia...."
ETH_SEPOLIA_RPC="https://eth-sepolia...."
```

# Commands

## Mine block at {timestamp} "fast forward time"

Fill timestamp

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"evm_mine","params":[{timestamp}],"id":1}' -H "Content-Type: application/json" http://localhost:4000
```

Or with `hardhat-mine`, adjust block, timestamp and rpc and run with `ts-node hardhat-mine`

## Start forks

```bash
npx hardhat node --port 4000 --config hardhat-eth.config.js
```

```bash
npx hardhat node --port 4001 --config hardhat-arb.config.js
```
