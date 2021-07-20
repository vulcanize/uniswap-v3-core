import { task, types } from "hardhat/config";
import '@nomiclabs/hardhat-ethers';
import { ContractTransaction } from "ethers";

const getMinTick = (tickSpacing: number) => Math.ceil(-887272 / tickSpacing) * tickSpacing;
const getMaxTick = (tickSpacing: number) => Math.floor(887272 / tickSpacing) * tickSpacing;

const APPROVE_AMOUNT = BigInt(1000000000000000000000000);

task("pool-mint", "Adds liquidity for the given position to the pool")
  .addParam('pool', 'Address of pool contract', undefined, types.string)
  .addParam('recipient', 'Address for which the liquidity will be created', undefined, types.string)
  .addParam('amount', 'Amount of liquidity to mint', undefined, types.string)
  .setAction(async (args, hre) => {
    const { pool: poolAddress, recipient, amount } = args
    const [signer] = await hre.ethers.getSigners();
    await hre.run('compile');

    const TestUniswapV3Callee = await hre.ethers.getContractFactory('TestUniswapV3Callee');
    const poolCallee = await TestUniswapV3Callee.deploy();

    const Pool = await hre.ethers.getContractFactory('UniswapV3Pool');
    const pool = Pool.attach(poolAddress);

    const token0Address = await pool.token0();
    const token1Address = await pool.token1();
    const tickSpacing = await pool.tickSpacing();

    // https://github.com/Uniswap/uniswap-v3-core/blob/main/test/UniswapV3Pool.spec.ts#L196
    const tickLower = getMinTick(tickSpacing);
    const tickUpper = getMaxTick(tickSpacing);

    const { abi: erc20ABI } = await hre.artifacts.readArtifact('IERC20Minimal')

    const token0 = new hre.ethers.Contract(token0Address, erc20ABI, signer);
    const token1 = new hre.ethers.Contract(token1Address, erc20ABI, signer);

    // Approving tokens for TestUniswapV3Callee contract.
    // https://github.com/Uniswap/uniswap-v3-core/blob/main/test/shared/utilities.ts#L187
    const t0 = await token0.approve(poolCallee.address, APPROVE_AMOUNT)
    await t0.wait();

    const t1 = await token1.approve(poolCallee.address, APPROVE_AMOUNT)
    await t1.wait();

    const transaction: ContractTransaction = await poolCallee.mint(poolAddress, recipient, BigInt(tickLower), BigInt(tickUpper), BigInt(amount));
    const receipt = await transaction.wait();

    if (receipt.events) {
      console.log('Transaction events');

      receipt.events.forEach(event => {
        console.log('Event name', event.event, event.args)
      });
    }
  });
