import { run } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const network = (await import("hardhat")).network.name;
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const filePath = path.join(deploymentsDir, `${network}.json`);

  if (!fs.existsSync(filePath)) {
    console.error(`Deployment file not found for network ${network}`);
    console.error("Please run the deploy script first");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(filePath, "utf8"));

  console.log("Verifying contracts on", network);
  console.log("TIP Token:", deployment.tipToken);
  console.log("Staking Contract:", deployment.stakingContract);

  // Verify TIP Token if it was deployed by us
  if (process.env.TIP_TOKEN_ADDRESS === undefined) {
    try {
      console.log("\nVerifying TIP Token...");
      await run("verify:verify", {
        address: deployment.tipToken,
        constructorArguments: [],
      });
      console.log("TIP Token verified successfully");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("TIP Token already verified");
      } else {
        console.error("Error verifying TIP Token:", error);
      }
    }
  }

  // Verify Staking Contract
  try {
    console.log("\nVerifying TIPStaking contract...");
    await run("verify:verify", {
      address: deployment.stakingContract,
      constructorArguments: [deployment.tipToken],
    });
    console.log("TIPStaking contract verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("TIPStaking contract already verified");
    } else {
      console.error("Error verifying TIPStaking contract:", error);
    }
  }

  console.log("\n=== Verification Complete ===");
  console.log(`View on Polygonscan:`);
  const baseUrl = network === "polygon" 
    ? "https://polygonscan.com/address/" 
    : "https://mumbai.polygonscan.com/address/";
  console.log(`TIP Token: ${baseUrl}${deployment.tipToken}`);
  console.log(`Staking Contract: ${baseUrl}${deployment.stakingContract}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });