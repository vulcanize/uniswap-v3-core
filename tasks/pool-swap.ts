import { task, types } from "hardhat/config";
import '@nomiclabs/hardhat-ethers';
import { ContractTransaction } from "ethers";

task("pool-swap", "Swap token0 for token1, or token1 for token0")
  .addParam('pool', 'Address of pool contract', undefined, types.string)
  .addParam('recipient', 'Address for which the liquidity will be created', undefined, types.string)
  .addParam('sqrtPrice', 'Initial sqrtPriceX96', undefined, types.int)
  .setAction(async (args, hre) => {
    const { pool: poolAddress, recipient, sqrtPrice } = args
    await hre.run('compile');

    const TestUniswapV3Callee = await hre.ethers.getContractFactory('TestUniswapV3Callee');
    const poolCallee = await TestUniswapV3Callee.deploy();

    const transaction: ContractTransaction = await poolCallee.swapToLowerSqrtPrice(poolAddress, BigInt(sqrtPrice), recipient);
    const receipt = await transaction.wait();

    if (receipt.events) {
      console.log('Transaction events');

      receipt.events.forEach(event => {
        console.log('Event name', event.event, event.args)
      });
    }
  });
