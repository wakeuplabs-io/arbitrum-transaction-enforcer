
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
# hardhat
L1_RPC="http://127.0.0.1:4000/"
L2_RPC="http://127.0.0.1:4001/"
DEVNET_PRIVKEY="0xc64d6375895d0a..."

# For hardhat forks
FORK_L2_RPC="https://arb-sepolia...."
FORK_L1_RPC="https://eth-sepolia...."


FROM_ADDRESS="0x44cdA3f339444F..."
FROM_PRIVATE_KEY="0xc64d6375895d0..."
```

## Testing

1. Setup `.env`
2. Initiate eth and arb hardhart forks with `npm run start:arb` and `npm run start:eth`
3. Run tests with `npm run test`

# Commands

## Mine block at {timestamp} "fast forward time"

Fill timestamp

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"evm_mine","params":[{timestamp}],"id":1}' -H "Content-Type: application/json" http://localhost:4000
```

Or with `hardhat-mine`, adjust block, timestamp and rpc and run with `ts-node hardhat-mine`

## Start forks

```bash
npm run start:arb
npm run start:eth
```





