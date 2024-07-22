//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// bridge
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bridgeAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'gasLimit', internalType: 'uint256', type: 'uint256' },
      { name: 'maxFeePerGas', internalType: 'uint256', type: 'uint256' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'sendUnsignedTransaction',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'delayedInboxAccs',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// inbox
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const inboxAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'gasLimit', internalType: 'uint256', type: 'uint256' },
      { name: 'maxFeePerGas', internalType: 'uint256', type: 'uint256' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'sendUnsignedTransaction',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sequencerInbox
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const sequencerInboxAbi = [
  {
    type: 'function',
    inputs: [
      {
        name: '_totalDelayedMessagesRead',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'kind', internalType: 'uint8', type: 'uint8' },
      { name: 'l1BlockAndTime', internalType: 'uint64[2]', type: 'uint64[2]' },
      { name: 'baseFeeL1', internalType: 'uint256', type: 'uint256' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'messageDataHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'forceInclusion',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalDelayedMessagesRead',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const
