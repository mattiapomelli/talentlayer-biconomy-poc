import { ethers } from "hardhat";

async function main() {
  const SimpleTalentLayerID = await ethers.getContractFactory(
    "SimpleTalentLayerID"
  );
  const simpleTalentLayerID = await SimpleTalentLayerID.deploy();

  await simpleTalentLayerID.deployed();

  console.log(
    `Deployed SimpleTalentLayerID at: ${simpleTalentLayerID.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
