const path = require('path')
const chalk = require('chalk')
const BigNumber = require('bignumber.js')

require('dotenv').config()
const constants = require(path.join(__dirname, '../src/types/constants'))


const StringHelpers = artifacts.require("Utils/StringHelpers")
const MigrationHelper = artifacts.require("Utils/MigrationHelper")

// Uniswap related.
const SwapToPrice = artifacts.require("Uniswap/SwapToPrice")
const UniswapV2Factory = artifacts.require("Uniswap/UniswapV2Factory")
const UniswapV2Library = artifacts.require("Uniswap/UniswapV2Library")
const UniswapV2OracleLibrary = artifacts.require("Uniswap/UniswapV2OracleLibrary")
const UniswapV2Pair = artifacts.require("Uniswap/UniswapV2Pair")
const UniswapV2Router02 = artifacts.require("Uniswap/UniswapV2Router02")
const UniswapV2Router02_Modified = artifacts.require("Uniswap/UniswapV2Router02_Modified")

// Collateral.
const WETH = artifacts.require("ERC20/WETH")
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC")
const FakeCollateral_USDT = artifacts.require("FakeCollateral/FakeCollateral_USDT")

// Collateral Pools
const ArthPoolLibrary = artifacts.require("Arth/Pools/ArthPoolLibrary")
const Pool_USDC = artifacts.require("Arth/Pools/Pool_USDC")
const Pool_USDT = artifacts.require("Arth/Pools/Pool_USDT")

// Oracles
const UniswapPairOracle_ARTH_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_WETH")
const UniswapPairOracle_ARTH_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDC")
const UniswapPairOracle_ARTH_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDT")
const UniswapPairOracle_ARTH_ARTHX = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_ARTHS")
const UniswapPairOracle_ARTHS_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_WETH")
const UniswapPairOracle_ARTHS_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_USDC")
const UniswapPairOracle_ARTHS_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_USDT")
const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH")
const UniswapPairOracle_USDT_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDT_WETH")

// Chainlink Price Consumer
const ChainlinkETHUSDPriceConsumer = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumer")
const ChainlinkETHUSDPriceConsumerTest = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumerTest")

// ARTH core
const ARTHStablecoin = artifacts.require("Arth/ARTHStablecoin")
const ARTHShares = artifacts.require("ARTHX/ARTHShares")
const TokenVesting = artifacts.require("ARTHS/TokenVesting")

// Governance related
//const GovernorAlpha = artifacts.require("Governance/GovernorAlpha")
const Timelock = artifacts.require("Governance/Timelock")

// Staking contracts
const StakingRewards_ARTH_WETH = artifacts.require("Staking/Variants/Stake_ARTH_WETH.sol")
const StakingRewards_ARTH_USDC = artifacts.require("Staking/Variants/Stake_ARTH_USDC.sol")
const StakingRewards_ARTH_ARTHX = artifacts.require("Staking/Variants/Stake_ARTH_ARTHS.sol")
const StakingRewards_ARTHS_WETH = artifacts.require("Staking/Variants/Stake_ARTHS_WETH.sol")

const DUMP_ADDRESS = "0x6666666666666666666666666666666666666666"

// Make sure Ganache is running beforehand
module.exports = async function (deployer, network, accounts) {

  const BIG6 = new BigNumber("1e6")
  const BIG18 = new BigNumber("1e18")

  const IS_MAINNET = (process.env.MIGRATION_MODE == 'mainnet')
  const IS_ROPSTEN = (process.env.MIGRATION_MODE == 'ropsten')

  // ======== Set the addresses ========

  const DEPLOYER_ADDRESS = accounts[0]
  const COLLATERAL_ARTH_AND_ARTHS_OWNER = accounts[1]
  const ORACLE_ADDRESS = accounts[2]
  const POOL_CREATOR = accounts[3]
  const TIMELOCK_ADMIN = accounts[4]
  const GOVERNOR_GUARDIAN_ADDRESS = accounts[5]
  const STAKING_OWNER = accounts[6]
  const STAKING_REWARDS_DISTRIBUTOR = accounts[7]
  // const COLLATERAL_ARTH_AND_ARTHS_OWNER = accounts[8]

  // ======== Set other constants ========

  const ONE_MILLION_DEC18 = new BigNumber("1000000e18")
  const FIVE_MILLION_DEC18 = new BigNumber("5000000e18")
  const TEN_MILLION_DEC18 = new BigNumber("10000000e18")
  const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18")
  const ONE_HUNDRED_MILLION_DEC6 = new BigNumber("100000000e6")
  const ONE_BILLION_DEC18 = new BigNumber("1000000000e18")
  const COLLATERAL_SEED_DEC18 = new BigNumber(508500e18)

  // Starting seed amounts
  const ARTH_SEED_AMOUNT_DEC18 = new BigNumber("10000e18")
  const ARTHS_SEED_AMOUNT_DEC18 = new BigNumber("10000e18")

  const redemptionFee = 400 // 0.04%
  const mintingFee = 300 // 0.03%
  const COLLATERAL_PRICE = 1040000 // $1.04
  const TIMELOCK_DELAY = 2 * 86400 // 2 days
  const DUMP_ADDRESS = "0x6666666666666666666666666666666666666666"
  const METAMASK_ADDRESS = process.env.METAMASK_ADDRESS

  // Print the addresses
  // ================= Start Initializing =================

  // Get the necessary instances
  let CONTRACT_ADDRESSES
  let timelockInstance
  let migrationHelperInstance
  let arthInstance
  let arthxInstance
  let governanceInstance
  let wethInstance
  let col_instance_USDC
  let col_instance_USDT

  if (process.env.MIGRATION_MODE != 'mainnet') {
    timelockInstance = await Timelock.deployed()
    migrationHelperInstance = await MigrationHelper.deployed()
    //governanceInstance = await GovernorAlpha.deployed()
    arthInstance = await ARTHStablecoin.deployed()
    arthxInstance = await ARTHShares.deployed()
    wethInstance = await WETH.deployed()
    col_instance_USDC = await FakeCollateral_USDC.deployed()
    col_instance_USDT = await FakeCollateral_USDT.deployed()
  }
  else {
    CONTRACT_ADDRESSES = constants.CONTRACT_ADDRESSES
    timelockInstance = await Timelock.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].misc.timelock)
    migrationHelperInstance = await MigrationHelper.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].misc.migration_helper)
    //governanceInstance = await GovernorAlpha.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].governance)
    arthInstance = await ARTHStablecoin.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].main.ARTH)
    arthxInstance = await ARTHShares.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].main.ARTHS)
    wethInstance = await WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].weth)
    col_instance_USDC = await FakeCollateral_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].collateral.USDC)
    col_instance_USDT = await FakeCollateral_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].collateral.USDT)

  }


  // CONTINUE MAIN DEPLOY CODE HERE
  // ====================================================================================================================
  // ====================================================================================================================


  // ======== Create or link the router and the SwapToPrice ========
  console.log(chalk.yellow('===== DEPLOY OR LINK THE ROUTER AND SWAP_TO_PRICE ====='))
  let routerInstance
  let uniswapFactoryInstance

  if (IS_MAINNET) {
    // Note UniswapV2Router02 vs UniswapV2Router02_Modified
    routerInstance = await UniswapV2Router02.at("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    uniswapFactoryInstance = await UniswapV2Factory.at("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f")
  }
  else if (IS_ROPSTEN) {
    // Note UniswapV2Router02 vs UniswapV2Router02_Modified
    routerInstance = await UniswapV2Router02.at("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    uniswapFactoryInstance = await UniswapV2Factory.at("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f")
  }
  else {
    await deployer.deploy(UniswapV2Router02_Modified, UniswapV2Factory.address, wethInstance.address)
    routerInstance = await UniswapV2Router02_Modified.deployed()
    uniswapFactoryInstance = await UniswapV2Factory.deployed()
  }

  let swapToPriceInstance
  if (IS_MAINNET) {
    swapToPriceInstance = await SwapToPrice.at('0xa61cBe7E326B13A8dbA11D00f42531BE704DF51B')
  }
  else {
    await deployer.deploy(SwapToPrice, uniswapFactoryInstance.address, routerInstance.address)
    swapToPriceInstance = await SwapToPrice.deployed()
  }


  // ======== Set the Uniswap pairs ========
  console.log(chalk.yellow('===== SET UNISWAP PAIRS ====='))
  console.log(chalk.blue('=== ARTH / XXXX ==='))
  await Promise.all([
    uniswapFactoryInstance.createPair(arthInstance.address, wethInstance.address, { from: METAMASK_ADDRESS }),
    uniswapFactoryInstance.createPair(arthInstance.address, col_instance_USDC.address, { from: METAMASK_ADDRESS }),
    uniswapFactoryInstance.createPair(arthInstance.address, col_instance_USDT.address, { from: METAMASK_ADDRESS }),
    uniswapFactoryInstance.createPair(arthInstance.address, arthxInstance.address, { from: METAMASK_ADDRESS })
  ])

  console.log(chalk.blue('=== ARTHX / XXXX ==='))
  await Promise.all([
    uniswapFactoryInstance.createPair(arthxInstance.address, wethInstance.address, { from: METAMASK_ADDRESS }),
    uniswapFactoryInstance.createPair(arthxInstance.address, col_instance_USDC.address, { from: METAMASK_ADDRESS }),
    uniswapFactoryInstance.createPair(arthxInstance.address, col_instance_USDT.address, { from: METAMASK_ADDRESS })
  ])

  if (!IS_MAINNET) {
    console.log(chalk.blue('=== XXXX / WETH ==='))
    await uniswapFactoryInstance.createPair(col_instance_USDC.address, wethInstance.address, { from: METAMASK_ADDRESS })
    await uniswapFactoryInstance.createPair(col_instance_USDT.address, wethInstance.address, { from: METAMASK_ADDRESS })
  }

  // ======== Get the addresses of the pairs ========
  console.log(chalk.yellow('===== GET THE ADDRESSES OF THE PAIRS ====='))
  const pair_addr_ARTH_WETH = await uniswapFactoryInstance.getPair(arthInstance.address, wethInstance.address, { from: METAMASK_ADDRESS })
  const pair_addr_ARTH_USDC = await uniswapFactoryInstance.getPair(arthInstance.address, col_instance_USDC.address, { from: METAMASK_ADDRESS })
  const pair_addr_ARTH_ARTHX = await uniswapFactoryInstance.getPair(arthInstance.address, arthxInstance.address, { from: METAMASK_ADDRESS })
  const pair_addr_ARTHS_WETH = await uniswapFactoryInstance.getPair(arthxInstance.address, wethInstance.address, { from: METAMASK_ADDRESS })

  // ======== Deploy the staking contracts ========
  console.log(chalk.yellow('===== DEPLOY THE STAKING CONTRACTS ====='))
  await deployer.link(ARTHStablecoin, [StakingRewards_ARTH_WETH, StakingRewards_ARTH_USDC, StakingRewards_ARTHS_WETH, StakingRewards_ARTH_ARTHS])
  await deployer.link(StringHelpers, [StakingRewards_ARTH_WETH, StakingRewards_ARTH_USDC, StakingRewards_ARTHS_WETH, StakingRewards_ARTH_ARTHS])
  await Promise.all([
    deployer.deploy(StakingRewards_ARTH_WETH, METAMASK_ADDRESS, METAMASK_ADDRESS, arthxInstance.address, pair_addr_ARTH_WETH, ARTHStablecoin.address, timelockInstance.address, 500000),
    deployer.deploy(StakingRewards_ARTH_USDC, METAMASK_ADDRESS, METAMASK_ADDRESS, arthxInstance.address, pair_addr_ARTH_USDC, ARTHStablecoin.address, timelockInstance.address, 500000),
    deployer.deploy(StakingRewards_ARTH_ARTHS, METAMASK_ADDRESS, METAMASK_ADDRESS, arthxInstance.address, pair_addr_ARTH_ARTHS, ARTHStablecoin.address, timelockInstance.address, 0),
    deployer.deploy(StakingRewards_ARTHS_WETH, METAMASK_ADDRESS, METAMASK_ADDRESS, arthxInstance.address, pair_addr_ARTHS_WETH, ARTHStablecoin.address, timelockInstance.address, 0)
  ])

  // ======== Get various staking addresses ========
  console.log(chalk.yellow('===== GET VARIOUS STAKING ADDRESSES ====='))
  const stakingInstance_ARTH_WETH = await StakingRewards_ARTH_WETH.deployed()
  const stakingInstance_ARTH_USDC = await StakingRewards_ARTH_USDC.deployed()
  const stakingInstance_ARTH_ARTHX = await StakingRewards_ARTH_ARTHS.deployed()
  const stakingInstance_ARTHS_WETH = await StakingRewards_ARTHS_WETH.deployed()

  // ======== Get various pair instances ========
  console.log(chalk.yellow('===== GET VARIOUS PAIR INSTANCES ====='))
  const pair_instance_ARTH_WETH = await UniswapV2Pair.at(pair_addr_ARTH_WETH)
  const pair_instance_ARTH_USDC = await UniswapV2Pair.at(pair_addr_ARTH_USDC)
  const pair_instance_ARTH_ARTHX = await UniswapV2Pair.at(pair_addr_ARTH_ARTHS)
  const pair_instance_ARTHS_WETH = await UniswapV2Pair.at(pair_addr_ARTHS_WETH)

  // ======== Add allowances to the Uniswap Router ========
  console.log(chalk.yellow('===== ADD ALLOWANCES TO THE UNISWAP ROUTER ====='))
  await Promise.all([
    wethInstance.approve(routerInstance.address, new BigNumber(2000000e18), { from: METAMASK_ADDRESS }),
    col_instance_USDC.approve(routerInstance.address, new BigNumber(2000000e6), { from: METAMASK_ADDRESS }),
    col_instance_USDT.approve(routerInstance.address, new BigNumber(2000000e6), { from: METAMASK_ADDRESS }),
    arthInstance.approve(routerInstance.address, new BigNumber(1000000e18), { from: METAMASK_ADDRESS }),
    arthxInstance.approve(routerInstance.address, new BigNumber(5000000e18), { from: METAMASK_ADDRESS })
  ])

  // ======== Note the addresses ========
  // If you are testing the frontend, you need to copy-paste the output of CONTRACT_ADDRESSES to the frontend src/misc/constants.tsx
  let CONTRACT_ADDRESSES_PHASE_2 = {
    [process.env.MIGRATION_MODE]: {
      main: {
        ARTH: arthInstance.address,
        ARTHS: arthxInstance.address,
        vesting: "NOT_DEPLOYED_YET"
      },
      weth: wethInstance.address,
      oracles: {
        ARTH_WETH: "NOT_DEPLOYED_YET",
        ARTH_USDC: "NOT_DEPLOYED_YET",
        ARTH_USDT: "NOT_DEPLOYED_YET",
        ARTH_ARTHS: "NOT_DEPLOYED_YET",
        ARTHS_WETH: "NOT_DEPLOYED_YET",
        ARTHS_USDC: "NOT_DEPLOYED_YET",
        ARTHS_USDT: "NOT_DEPLOYED_YET",
        USDC_WETH: "NOT_DEPLOYED_YET",
        USDT_WETH: "NOT_DEPLOYED_YET",
      },
      collateral: {
        USDC: col_instance_USDC.address,
        USDT: col_instance_USDT.address,
      },
      //governance: governanceInstance.address,
      pools: {
        USDC: "NOT_DEPLOYED_YET",
        USDT: "NOT_DEPLOYED_YET",
      },
      uniswap_other: {
        router: routerInstance.address,
        factory: uniswapFactoryInstance.address,
      },
      pricing: {
        swap_to_price: swapToPriceInstance.address
      },
      misc: {
        timelock: timelockInstance.address,
        migration_helper: migrationHelperInstance.address
      },
      libraries: {
        UniswapV2OracleLibrary: UniswapV2OracleLibrary.address,
        UniswapV2Library: UniswapV2Library.address,
        ArthPoolLibrary: ArthPoolLibrary.address,
      },
      pair_tokens: {
        'Uniswap ARTH/WETH': pair_instance_ARTH_WETH.address,
        'Uniswap ARTH/USDC': pair_instance_ARTH_USDC.address,
        'Uniswap ARTH/ARTHS': pair_instance_ARTH_ARTHS.address,
        'Uniswap ARTHS/WETH': pair_instance_ARTHS_WETH.address,
      },
      staking_contracts: {
        'Uniswap ARTH/WETH': stakingInstance_ARTH_WETH.address,
        'Uniswap ARTH/USDC': stakingInstance_ARTH_USDC.address,
        'Uniswap ARTH/ARTHS': stakingInstance_ARTH_ARTHS.address,
        'Uniswap ARTHS/WETH': stakingInstance_ARTHS_WETH.address,
      }
    }
  }

  console.log("CONTRACT_ADDRESSES: ", CONTRACT_ADDRESSES_PHASE_2)
}
