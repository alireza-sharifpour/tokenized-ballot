# Solidity Project: MyToken and TokenizedBallot

This project demonstrates the integration of Solidity smart contracts with the Ethereum blockchain, featuring an ERC20 token (`MyToken`) and a voting system (`TokenizedBallot`). It includes a TypeScript script for deploying and interacting with these contracts on the Ethereum blockchain using the Viem library.

## Smart Contracts

- **MyToken.sol**: An ERC20 token that implements the ERC20Permit and ERC20Votes extensions, enabling operations like minting tokens and voting with token holdings.
- **TokenizedBallot.sol**: A contract for creating a token-based voting system where token holders can vote for proposals using their tokens.

## Deployment and Interaction

To deploy the `MyToken` and `TokenizedBallot` contracts and interact with them, run the TypeScript script provided in the project. This script demonstrates how to mint tokens, transfer tokens to another account, delegate votes, and cast votes.

### Running the Script

Use the following command to deploy the contracts and interact with them on the Ethereum blockchain:

`npx ts-node --files ./scripts/DeployWithViemAndContractInteraction.ts`

This will deploy the `MyToken` and `TokenizedBallot` contracts, perform operations such as token minting, transferring tokens to a second account, delegating voting power, casting a vote, and displaying the winning proposal.

## Output

Running the script will output the process of deploying the contracts, minting and transferring tokens, delegating votes, voting, and announcing the winning proposal in the terminal.

## Considerations

- Make sure you have sufficient ETH in your wallet to cover the gas costs associated with deploying and interacting with the contracts.
- This project is configured to use the Sepolia test network. Ensure you have test ETH for this network.
- Familiarize yourself with the functionality of each smart contract and the deployment/interaction script before executing any transactions on the Ethereum blockchain.
