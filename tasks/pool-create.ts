import { task, types } from "hardhat/config";
import { ContractTransaction } from "ethers";
import '@nomiclabs/hardhat-ethers';

task("pool-create", "Creates pool using Factory contract")
  .addParam('factory', 'Address of factory contract', undefined, types.string)
  .addParam('token0', 'Address of first token contract', undefined, types.string)
  .addParam('token1', 'Address of second token contract', undefined, types.string)
  .addParam('fee', "The pool's fee", undefined, types.int)
  .setAction(async (args, hre) => {
    const { factory: factoryAddress, token0, token1, fee } = args

    const Factory = await hre.ethers.getContractFactory("UniswapV3Factory");
    const factory = Factory.attach(factoryAddress);
    const transaction: ContractTransaction = await factory.createPool(token0, token1, fee)
    const receipt = await transaction.wait();

    if (receipt.events) {
      const poolCreatedEvent = receipt.events.find(el => el.event === 'PoolCreated');

      if (poolCreatedEvent && poolCreatedEvent.args) {
        const { pool } = poolCreatedEvent.args;
        console.log('Pool deployed to:', pool);
      }
    }
  });
