import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Deploy TIP Token (for testing - skip if using existing token)
  let tipTokenAddress = process.env.TIP_TOKEN_ADDRESS;
  
  if (!tipTokenAddress) {
    console.log("Deploying TIP Token...");
    const TIPToken = await ethers.getContractFactory("TIPToken");
    const tipToken = await TIPToken.deploy();
    await tipToken.waitForDeployment();
    tipTokenAddress = await tipToken.getAddress();
    console.log("TIP Token deployed to:", tipTokenAddress);

    // Mint additional tokens for rewards pool
    const mintAmount = ethers.parseEther("100000");
    await tipToken.mint(deployer.address, mintAmount);
    console.log("Minted", ethers.formatEther(mintAmount), "TIP tokens for rewards");
  } else {
    console.log("Using existing TIP Token at:", tipTokenAddress);
  }

  // Deploy Staking Contract
  console.log("Deploying TIPStaking contract...");
  const TIPStaking = await ethers.getContractFactory("TIPStaking");
  const staking = await TIPStaking.deploy(tipTokenAddress);
  await staking.waitForDeployment();
  
  const stakingAddress = await staking.getAddress();
  console.log("TIPStaking deployed to:", stakingAddress);

  // Transfer rewards to staking contract
  const TIPToken = await ethers.getContractFactory("TIPToken");
  const tipToken = TIPToken.attach(tipTokenAddress) as any;
  
  const rewardsAmount = ethers.parseEther("50000");
  console.log("Transferring", ethers.formatEther(rewardsAmount), "TIP tokens to staking contract for rewards...");
  await tipToken.transfer(stakingAddress, rewardsAmount);

  // Save deployment addresses
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    tipToken: tipTokenAddress,
    stakingContract: stakingAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const network = (await ethers.provider.getNetwork()).name;
  const filePath = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("TIP Token:", tipTokenAddress);
  console.log("Staking Contract:", stakingAddress);
  console.log("Deployment info saved to:", filePath);
  console.log("\nDon't forget to:");
  console.log("1. Verify the contracts on Polygonscan");
  console.log("2. Update the frontend .env with the contract addresses");
  console.log("3. Transfer more TIP tokens to the staking contract if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });