import {
  createPublicClient,
  http,
  createWalletClient,
  formatEther,
  toHex,
  Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import {
  abi as abiTokenizedBallot,
  bytecode as bytecodeTokenizedBallot,
} from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import {
  abi as abiMyToken,
  bytecode as bytecodeMyToken,
} from "../artifacts/contracts/MyToken.sol/MyToken.json"; // Add this line

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  const proposals = process.argv.slice(2);
  if (!proposals || proposals.length < 1)
    throw new Error("Proposals not provided");

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const deployer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // Deploy MyToken contract first
  console.log("\nDeploying MyToken contract");
  const myTokenDeploymentHash = await deployer.deployContract({
    abi: abiMyToken,
    bytecode: bytecodeMyToken as Address,
    args: [], // No constructor arguments for MyToken
  });
  console.log(
    "Transaction hash for MyToken deployment:",
    myTokenDeploymentHash
  );
  console.log("Waiting for MyToken contract deployment to be confirmed...");
  const myTokenReceipt = await publicClient.waitForTransactionReceipt({
    hash: myTokenDeploymentHash,
  });
  console.log("MyToken contract deployed to:", myTokenReceipt.contractAddress);

  // Assuming targetBlockNumber is correctly set or calculated here
  const targetBlockNumber = await publicClient.getBlockNumber();

  // Now deploy TokenizedBallot using the address of the deployed MyToken
  console.log("\nDeploying TokenizedBallot contract");
  const tokenizedBallotHash = await deployer.deployContract({
    abi: abiTokenizedBallot,
    bytecode: bytecodeTokenizedBallot as Address,
    args: [
      proposals.map((prop) => toHex(prop, { size: 32 })), // Proposal names
      myTokenReceipt.contractAddress, // Use MyToken contract address here
      targetBlockNumber.toString(), // Convert to string if necessary
    ],
  });
  console.log(
    "Transaction hash for TokenizedBallot deployment:",
    tokenizedBallotHash
  );
  console.log(
    "Waiting for TokenizedBallot contract deployment to be confirmed..."
  );
  const tokenizedBallotReceipt = await publicClient.waitForTransactionReceipt({
    hash: tokenizedBallotHash,
  });
  console.log(
    "TokenizedBallot contract deployed to:",
    tokenizedBallotReceipt.contractAddress
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx ts-node --files ./scripts/DeployWithViem.ts "Proposal1" "Proposal2" "Proposal3"

// Deploying MyToken contract
// Transaction hash for MyToken deployment: 0x227d6699a74489f465396cb4611be866fc56088c4734ff878ee23bbba92167f7
// Waiting for MyToken contract deployment to be confirmed...
// MyToken contract deployed to: 0x3e1c841928ac8136674dbc4006b442c9cf1cb3d8

// Deploying TokenizedBallot contract
// Transaction hash for TokenizedBallot deployment: 0xdfdaf26d7db408bf7a530eb184163f1598f0535362c1a35822f85d4e42e45526
// Waiting for TokenizedBallot contract deployment to be confirmed...
// TokenizedBallot contract deployed to: 0x9e3c14cb2a890b05d2068f2b905ea7af8aae6ff5
