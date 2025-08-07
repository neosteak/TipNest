/**
 * @title Polygon Mainnet Deployment Script
 * @notice Production deployment script for TipNest Protocol
 * @dev Deploy TIP Token and Staking contracts to Polygon Mainnet
 */

import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // Validate environment
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("Please set DEPLOYER_PRIVATE_KEY in .env file");
  }

  if (!process.env.POLYGON_RPC_URL) {
    throw new Error("Please set POLYGON_RPC_URL in .env file");
  }

  console.log("=====================================");
  console.log("   TipNest Protocol - Polygon Mainnet Deployment");
  console.log("=====================================\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from address:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC\n");

  if (balance < ethers.parseEther("0.5")) {
    throw new Error("Insufficient MATIC balance. Need at least 0.5 MATIC for deployment");
  }

  // Deploy TIP Token
  let tipTokenAddress = process.env.TIP_TOKEN_ADDRESS;
  
  if (!tipTokenAddress) {
    console.log("📦 Deploying TIP Token...");
    const TIPToken = await ethers.getContractFactory("TIPToken");
    const tipToken = await TIPToken.deploy();
    await tipToken.waitForDeployment();
    tipTokenAddress = await tipToken.getAddress();
    console.log("✅ TIP Token deployed to:", tipTokenAddress);

    // Mint initial rewards supply
    const mintAmount = ethers.parseEther("100000"); // 100k TIP for rewards
    console.log("🪙 Minting", ethers.formatEther(mintAmount), "TIP for rewards pool...");
    const mintTx = await tipToken.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log("✅ Tokens minted successfully\n");
  } else {
    console.log("ℹ️  Using existing TIP Token at:", tipTokenAddress, "\n");
  }

  // Deploy Staking Contract
  console.log("📦 Deploying TIPStaking contract...");
  const TIPStaking = await ethers.getContractFactory("TIPStaking");
  const staking = await TIPStaking.deploy(tipTokenAddress);
  await staking.waitForDeployment();
  
  const stakingAddress = await staking.getAddress();
  console.log("✅ TIPStaking deployed to:", stakingAddress);

  // Transfer initial rewards to staking contract
  const TIPToken = await ethers.getContractFactory("TIPToken");
  const tipToken = TIPToken.attach(tipTokenAddress) as any;
  
  const rewardsAmount = ethers.parseEther("50000"); // 50k TIP for initial rewards
  console.log("\n💸 Transferring", ethers.formatEther(rewardsAmount), "TIP to staking contract...");
  const transferTx = await tipToken.transfer(stakingAddress, rewardsAmount);
  await transferTx.wait();
  console.log("✅ Rewards transferred successfully");

  // Save deployment info
  const deploymentInfo = {
    network: "polygon",
    chainId: 137,
    tipToken: tipTokenAddress,
    stakingContract: stakingAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    initialRewards: ethers.formatEther(rewardsAmount),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filePath = path.join(deploymentsDir, "polygon-mainnet.json");
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  // Final summary
  console.log("\n=====================================");
  console.log("   ✅ DEPLOYMENT SUCCESSFUL!");
  console.log("=====================================");
  console.log("\n📋 Contract Addresses:");
  console.log("   TIP Token:", tipTokenAddress);
  console.log("   Staking Contract:", stakingAddress);
  console.log("\n📁 Deployment info saved to:", filePath);
  console.log("\n⚠️  IMPORTANT NEXT STEPS:");
  console.log("   1. Verify contracts on PolygonScan:");
  console.log("      npx hardhat verify --network polygon", stakingAddress, tipTokenAddress);
  console.log("   2. Update frontend .env with new addresses");
  console.log("   3. Test all functions on mainnet");
  console.log("   4. Consider transferring ownership to multisig");
  console.log("\n🔗 View on PolygonScan:");
  console.log("   https://polygonscan.com/address/" + stakingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });