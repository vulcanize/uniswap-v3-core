import '@nomiclabs/hardhat-ethers';
import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("UniswapV3Factory");
  const factory = await Factory.deploy();

  console.log("Factory deployed to:", factory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
