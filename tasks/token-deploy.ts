import { task, types } from "hardhat/config";
import '@nomiclabs/hardhat-ethers';

task("token-deploy", "Deploys new token")
  .setAction(async (args, hre) => {
    const { ethers } = hre
    await hre.run("compile");

    const Token = await ethers.getContractFactory('TestERC20');

    // https://github.com/Uniswap/uniswap-v3-core/blob/main/test/shared/fixtures.ts#L28
    const token = await Token.deploy(ethers.BigNumber.from(2).pow(255));

    console.log(`Token deployed to:`, token.address)
    return token;
  });
