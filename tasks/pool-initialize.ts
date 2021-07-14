import { task, types } from "hardhat/config";
import { BigNumber, ContractTransaction } from "ethers";
import '@nomiclabs/hardhat-ethers';

task("pool-initialize", "Initializes a pool")
  .addParam('pool', 'Address of pool contract', undefined, types.string)
  .addParam('sqrtPrice', 'Initial sqrtPriceX96', undefined, types.string)
  .setAction(async (args, hre) => {
    const { pool: poolAddress, sqrtPrice } = args
    await hre.run('compile');
    const Pool = await hre.ethers.getContractFactory('UniswapV3Pool')
    const pool = Pool.attach(poolAddress);
    const transaction: ContractTransaction = await pool.initialize(BigNumber.from(sqrtPrice));
    const receipt = await transaction.wait();

    if (receipt.events) {
      const poolInitializeEvent = receipt.events.find(el => el.event === 'Initialize');

      if (poolInitializeEvent && poolInitializeEvent.args) {
        const { sqrtPriceX96, tick } = poolInitializeEvent.args;
        console.log('Pool initialized:', sqrtPriceX96.toString(), tick);
      }
    }
  });
