import { task } from "hardhat/config";
import '@nomiclabs/hardhat-ethers';

task("factory-deploy", "Deploys Factory contract")
  .setAction(async (args, hre) => {
    await hre.run("compile");
    const Factory = await hre.ethers.getContractFactory("UniswapV3Factory");
    const factory = await Factory.deploy();

    console.log("Factory deployed to:", factory.address);
  });
