import {
  createPublicClient,
  http,
  createWalletClient,
  parseEther,
  formatEther,
  toHex,
  hexToString,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import myToken from "../artifacts/contracts/MyToken.sol/MyToken.json";
import tokenizedBallot from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
dotenv.config();

// Define deployer and second account private keys
const deployerPrivateKey: string = process.env.PRIVATE_KEY || "";
const secondAddressPrivateKey: string = process.env.SECOND_PRIVATE_KEY || "";

// Define the amount to mint for the deployer
const MINT_VALUE = parseEther("100");

// Main function
async function main() {
  // Convert private keys to account objects
  const deployerAccount = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const secondAccount = privateKeyToAccount(`0x${secondAddressPrivateKey}`);

  // Create Viem clients
  const publicClient = await createPublicClient({
    chain: sepolia,
    transport: http(
      `https://eth-sepolia.g.alchemy.com/v2/${
        process.env.ALCHEMY_API_KEY || ""
      }`
    ),
  });
  const deployer = createWalletClient({
    account: deployerAccount,
    chain: sepolia,
    transport: http(
      `https://eth-sepolia.g.alchemy.com/v2/${
        process.env.ALCHEMY_API_KEY || ""
      }`
    ),
  });

  // Display deployer's address and balance
  console.log("Deployer address:", deployer.account.address);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );

  // Deploy MyToken contract
  console.log("\nDeploying MyToken contract");
  const hash = await deployer.deployContract({
    abi: myToken.abi,
    bytecode: myToken.bytecode as `0x${string}`,
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
  const tokenContractAddress = receipt.contractAddress;
  console.log("Token contract deployed to:", tokenContractAddress);

  // Mint tokens to the deployer
  const mintTx = await deployer.writeContract({
    address: tokenContractAddress!,
    abi: myToken.abi,
    functionName: "mint",
    args: [deployer.account.address, MINT_VALUE],
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTx });
  console.log("Transaction hash: ", mintTx);
  const balanceDeployer = await publicClient.readContract({
    address: tokenContractAddress!,
    abi: myToken.abi,
    functionName: "balanceOf",
    args: [deployer.account.address],
  });
  console.log(
    `Deployer ${deployer.account.address} has ${formatEther(
      balanceDeployer as bigint
    )} units of MyToken\n`
  );

  // Transfer tokens to the second account
  const trTxSecond = await deployer.writeContract({
    address: tokenContractAddress!,
    abi: myToken.abi,
    functionName: "transfer",
    args: [secondAccount.address, parseEther("20")],
  });
  await publicClient.waitForTransactionReceipt({ hash: trTxSecond });
  const balanceSecond = await publicClient.readContract({
    address: tokenContractAddress!,
    abi: myToken.abi,
    functionName: "balanceOf",
    args: [secondAccount.address],
  });
  console.log(
    `Second account ${secondAccount.address} has ${formatEther(
      balanceSecond as bigint
    )} units of MyToken after TX\n`
  );

  // Delegate voting power from deployer to the second account
  const delgTxSecond = await deployer.writeContract({
    address: tokenContractAddress!,
    abi: myToken.abi,
    functionName: "delegate",
    args: [secondAccount.address],
  });
  await publicClient.waitForTransactionReceipt({ hash: delgTxSecond });
  const votesSecond = await publicClient.readContract({
    address: tokenContractAddress!,
    abi: myToken.abi,
    functionName: "getVotes",
    args: [secondAccount.address],
  });
  console.log(
    `Second account ${secondAccount.address} has ${formatEther(
      votesSecond as bigint
    )} units of voting power after delegating\n`
  );

  // Get the current block number
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Blocknumber is: ", blockNumber);

  // Define proposals for the Tokenized Ballot contract
  const PROPOSALS = ["Vanilla", "Chocolate", "Strawberry"];

  // Deploy Tokenized Ballot contract
  console.log("\nDeploying Tokenized Ballot contract");
  const hash2 = await deployer.deployContract({
    abi: tokenizedBallot.abi,
    bytecode: tokenizedBallot.bytecode as `0x${string}`,
    args: [
      PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
      tokenContractAddress,
      blockNumber,
    ],
  });
  console.log("Transaction hash2:", hash2);
  console.log("Waiting for confirmations...");

  const receipt2 = await publicClient.waitForTransactionReceipt({
    hash: hash2,
  });
  const ballotContractAddress = receipt2.contractAddress;
  console.log("Ballot contract deployed to:", ballotContractAddress);

  // Cast vote from the second account
  const voteTxSecond = await deployer.writeContract({
    address: ballotContractAddress!,
    abi: tokenizedBallot.abi,
    functionName: "vote",
    args: [BigInt(0), parseEther("1")],
  });
  await publicClient.waitForTransactionReceipt({ hash: voteTxSecond });
  console.log("Second account voted");

  // Retrieve winner name and past votes
  const winnerName = await publicClient.readContract({
    address: ballotContractAddress!,
    abi: tokenizedBallot.abi,
    functionName: "winnerName",
    args: [],
  });
  const blockNumber2 = await publicClient.getBlockNumber();
  const pastVotes = await publicClient.readContract({
    address: tokenContractAddress!,
    abi: myToken.abi,
    functionName: "getPastVotes",
    args: [secondAccount.address, blockNumber2 - 1n],
  });
  console.log("Past votes of second account: ", pastVotes);
  console.log(
    "The winning proposal is: " +
      hexToString(winnerName as `0x${string}`, { size: 32 })
  );
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
