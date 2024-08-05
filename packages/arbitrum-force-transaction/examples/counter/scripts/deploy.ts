// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const Counter = await ethers.getContractFactory("Counter");

  const counter = await Counter.deploy();
  console.log("Counter deployed to:", await counter.getAddress());
}

// Run the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
