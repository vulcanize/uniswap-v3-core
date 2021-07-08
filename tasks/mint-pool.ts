import { task, types } from "hardhat/config";
import '@nomiclabs/hardhat-ethers';

import {
  abi as ERC20_ABI
} from '../artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json';

const getMinTick = (tickSpacing: number) => Math.ceil(-887272 / tickSpacing) * tickSpacing;
const getMaxTick = (tickSpacing: number) => Math.floor(887272 / tickSpacing) * tickSpacing;

const APPROVE_AMOUNT = BigInt(1000000000000000000000000);

task("mint-pool", "Adds liquidity for the given position to the pool")
  .addParam('pool', 'Address of pool contract', undefined, types.string)
  .addParam('recipient', 'Address for which the liquidity will be created', undefined, types.string)
  .addParam('tickLower', 'Lower tick of the position in which to add liquidity', undefined, types.string)
  .addParam('tickUpper', 'Upper tick of the position in which to add liquidity', undefined, types.string)
  .addParam('amount', 'Amount of liquidity to mint', undefined, types.string)
  .setAction(async (args, hre) => {
    const { pool: poolAddress, recipient, tickLower, tickUpper, amount } = args
    const [signer] = await hre.ethers.getSigners();

    const TestUniswapV3Callee = await hre.ethers.getContractFactory('TestUniswapV3Callee');
    const poolCallee = await TestUniswapV3Callee.deploy();

    const Pool = await hre.ethers.getContractFactory('UniswapV3Pool');
    const pool = Pool.attach(poolAddress);

    const token0Address = await pool.token0();
    const token1Address = await pool.token1();
    const tickSpacing = await pool.tickSpacing();

    console.log(token0Address, token1Address, tickSpacing, getMinTick(tickSpacing), getMaxTick(tickSpacing));

    const token0 = new hre.ethers.Contract(token0Address, ERC20_ABI, signer);
    const token1 = new hre.ethers.Contract(token1Address, ERC20_ABI, signer);

    const t0 = await token0.approve(poolAddress, APPROVE_AMOUNT);
    await t0.wait();

    const t1 = await token1.approve(poolAddress, APPROVE_AMOUNT);
    await t1.wait();

    const transaction = await poolCallee.mint(poolAddress, recipient, BigInt(tickLower), BigInt(tickUpper), BigInt(amount));
    const receipt = await transaction.wait();
    console.log(JSON.stringify(receipt));
  });
