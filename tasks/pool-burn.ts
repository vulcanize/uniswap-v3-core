import { task, types } from "hardhat/config";
import '@nomiclabs/hardhat-ethers';
import { ContractTransaction } from "ethers";

const getMinTick = (tickSpacing: number) => Math.ceil(-887272 / tickSpacing) * tickSpacing;
const getMaxTick = (tickSpacing: number) => Math.floor(887272 / tickSpacing) * tickSpacing;

task("pool-burn", "Burn liquidity from the sender and account tokens owed for the liquidity to the position")
  .addParam('pool', 'Address of pool contract', undefined, types.string)
  .addParam('amount', 'Amount of liquidity to burn', undefined, types.string)
  .setAction(async (args, hre) => {
    const { pool: poolAddress, amount } = args
    await hre.run('compile');

    const Pool = await hre.ethers.getContractFactory('UniswapV3Pool');
    const pool = Pool.attach(poolAddress);

    const tickSpacing = await pool.tickSpacing();

    // https://github.com/Uniswap/uniswap-v3-core/blob/main/test/UniswapV3Pool.spec.ts#L196
    const tickLower = getMinTick(tickSpacing);
    const tickUpper = getMaxTick(tickSpacing);

    const transaction: ContractTransaction = await pool.burn(BigInt(tickLower), BigInt(tickUpper), BigInt(amount));
    const receipt = await transaction.wait();

    if (receipt.events) {
      console.log('Transaction events');

      receipt.events.forEach(event => {
        console.log('Event name', event.event, event.args)
      });
    }
  });
