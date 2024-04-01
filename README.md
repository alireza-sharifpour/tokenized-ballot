# Ethereum Voting Project

This Ethereum Voting Project implements a smart contract named `Ballot` for conducting secure and transparent voting processes on the Ethereum blockchain. The contract allows for vote delegation, enabling participants not only to vote on proposals but also to delegate their voting power to others. This document provides an overview of the project, setup instructions, and guidance on how to interact with the deployed contract.

## Features

- **Create Ballot:** Initiate a voting process with multiple proposals.
- **Vote:** Allows participants to vote for proposals directly.
- **Delegate:** Participants can delegate their vote to another voter.
- **Compute Winner:** Automatically calculates the proposal with the highest votes.
- **Secure & Transparent:** Leverages Ethereum blockchain for a tamper-proof and transparent voting mechanism.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.
- An Ethereum wallet with some testnet Ether (e.g., on the Ropsten or Sepolia testnet).
- An [Alchemy](https://alchemy.com/) account or other Ethereum node provider for interacting with the blockchain.


## Configuration

1. Create a `.env` file in the project root directory.
2. Add the following environment variables:

```
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=your_private_key
```


## Usage

The project includes scripts for interacting with the `Ballot` contract:

- **Deploy Contract:** Deploy the `Ballot` contract to the Ethereum testnet.
- **Cast Vote (`CastVote.ts`):** Cast a vote for a specific proposal.
- **Delegate Vote (`DelegateVote.ts`):** Delegate voting power to another address.
- **Give Right to Vote (`GiveRightToVote.ts`):** Grant a voter the right to participate in the ballot.

### Example: Casting a Vote

```
npx ts-node --files ./scripts/CastVote.ts <ContractAddress> <ProposalIndex>
```

