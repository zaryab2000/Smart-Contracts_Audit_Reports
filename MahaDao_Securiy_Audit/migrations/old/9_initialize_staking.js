const path = require('path');
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const constants = require(path.join(__dirname, '../src/types/constants'));

const BigNumber = require('bignumber.js');
// require('@openzeppelin/test-helpers/configure')({
//   provider: process.env.NETWORK_ENDPOINT,
// });

const { expectEvent, send, shouldFail, time } = require('@openzeppelin/test-helpers');
const BIG6 = new BigNumber("1e6");
const BIG12 = new BigNumber("1e12");
const BIG18 = new BigNumber("1e18");
const chalk = require('chalk');

const Address = artifacts.require("Utils/Address");
const BlockMiner = artifacts.require("Utils/BlockMiner");
const MigrationHelper = artifacts.require("Utils/MigrationHelper");
const StringHelpers = artifacts.require("Utils/StringHelpers");
const Math = artifacts.require("Math/Math");
const SafeMath = artifacts.require("Math/SafeMath");
const Babylonian = artifacts.require("Math/Babylonian");
const FixedPoint = artifacts.require("Math/FixedPoint");
const UQ112x112 = artifacts.require("Math/UQ112x112");
const Owned = artifacts.require("Staking/Owned");
const ERC20 = artifacts.require("ERC20/ERC20");
const ERC20Custom = artifacts.require("ERC20/ERC20Custom");
const SafeERC20 = artifacts.require("ERC20/SafeERC20");

// Uniswap related
const TransferHelper = artifacts.require("Uniswap/TransferHelper");
const SwapToPrice = artifacts.require("Uniswap/SwapToPrice");
const UniswapV2ERC20 = artifacts.require("Uniswap/UniswapV2ERC20");
const UniswapV2Factory = artifacts.require("Uniswap/UniswapV2Factory");
const UniswapV2Library = artifacts.require("Uniswap/UniswapV2Library");
const UniswapV2OracleLibrary = artifacts.require("Uniswap/UniswapV2OracleLibrary");
const UniswapV2Pair = artifacts.require("Uniswap/UniswapV2Pair");
const UniswapV2Router02 = artifacts.require("Uniswap/UniswapV2Router02");
const UniswapV2Router02_Modified = artifacts.require("Uniswap/UniswapV2Router02_Modified");

// Collateral
const WETH = artifacts.require("ERC20/WETH");
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");
const FakeCollateral_USDT = artifacts.require("FakeCollateral/FakeCollateral_USDT");


// Collateral Pools
const ArthPoolLibrary = artifacts.require("Arth/Pools/ArthPoolLibrary");
const Pool_USDC = artifacts.require("Arth/Pools/Pool_USDC");
const Pool_USDT = artifacts.require("Arth/Pools/Pool_USDT");


// Oracles
const UniswapPairOracle_ARTH_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_WETH");
const UniswapPairOracle_ARTH_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDC");
const UniswapPairOracle_ARTH_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDT");

const UniswapPairOracle_ARTH_ARTHX = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_ARTHS");
const UniswapPairOracle_ARTHS_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_WETH");
const UniswapPairOracle_ARTHS_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_USDC");
const UniswapPairOracle_ARTHS_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_USDT");

const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH");
const UniswapPairOracle_USDT_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDT_WETH");


// Chainlink Price Consumer
const ChainlinkETHUSDPriceConsumer = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumer");
const ChainlinkETHUSDPriceConsumerTest = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumerTest");

// ARTH core
const ARTHStablecoin = artifacts.require("Arth/ARTHStablecoin");
const ARTHShares = artifacts.require("ARTHX/ARTHShares");
const TokenVesting = artifacts.require("ARTHS/TokenVesting");

// Governance related
//const GovernorAlpha = artifacts.require("Governance/GovernorAlpha");
const Timelock = artifacts.require("Governance/Timelock");

// Staking contracts
const StakingRewards_ARTH_WETH = artifacts.require("Staking/Variants/Stake_ARTH_WETH.sol");
const StakingRewards_ARTH_USDC = artifacts.require("Staking/Variants/Stake_ARTH_USDC.sol");
const StakingRewards_ARTH_ARTHX = artifacts.require("Staking/Variants/Stake_ARTH_ARTHS.sol");
const StakingRewards_ARTHS_WETH = artifacts.require("Staking/Variants/Stake_ARTHS_WETH.sol");

const DUMP_ADDRESS = "0x6666666666666666666666666666666666666666";

// Make sure Ganache is running beforehand
module.exports = async function (deployer, network, accounts) {
  const IS_MAINNET = (process.env.MIGRATION_MODE == 'mainnet');

  // ======== Set the addresses ========

  const COLLATERAL_ARTH_AND_ARTHS_OWNER = accounts[1];
  const ORACLE_ADDRESS = accounts[2];
  const POOL_CREATOR = accounts[3];
  const TIMELOCK_ADMIN = accounts[4];
  const GOVERNOR_GUARDIAN_ADDRESS = accounts[5];
  const STAKING_OWNER = accounts[6];
  const STAKING_REWARDS_DISTRIBUTOR = accounts[7];
  // const COLLATERAL_ARTH_AND_ARTHS_OWNER = accounts[8];

  // ======== Set other constants ========

  const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
  const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
  const TEN_MILLION_DEC18 = new BigNumber("10000000e18");
  const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
  const ONE_BILLION_DEC18 = new BigNumber("1000000000e18");
  const COLLATERAL_SEED_DEC18 = new BigNumber(508500e18);

  const redemptionFee = 400; // 0.04%
  const mintingFee = 300; // 0.03%
  const COLLATERAL_PRICE = 1040000; // $1.04
  const ARTH_PRICE = 980000; // $0.98
  const ARTHS_PRICE = 210000; // $0.21
  const TIMELOCK_DELAY = 86400 * 2; // 2 days
  const DUMP_ADDRESS = "0x6666666666666666666666666666666666666666";
  const METAMASK_ADDRESS = process.env.METAMASK_ADDRESS;;

  // ================= Start Initializing =================

  // Get the necessary instances
  let CONTRACT_ADDRESSES;
  let timelockInstance;
  let migrationHelperInstance;
  let arthInstance;
  let arthxInstance;
  let tokenVestingInstance;
  let governanceInstance;
  let wethInstance;
  let col_instance_USDC;
  let col_instance_USDT;

  let routerInstance;
  let uniswapFactoryInstance;
  let swapToPriceInstance;
  let oracle_instance_ARTH_WETH;
  let oracle_instance_ARTH_USDC;
  let oracle_instance_ARTH_USDT;

  let oracle_instance_ARTH_ARTHS;
  let oracle_instance_ARTHS_WETH;
  let oracle_instance_ARTHS_USDC;
  let oracle_instance_ARTHS_USDT;

  let oracle_instance_USDC_WETH;
  let oracle_instance_USDT_WETH;

  let stakingInstance_ARTH_WETH;
  let stakingInstance_ARTH_USDC;
  let stakingInstance_ARTH_ARTHS;
  let stakingInstance_ARTHS_WETH;
  let pool_instance_USDC;
  let pool_instance_USDT;


  // Get the necessary instances
  if (process.env.MIGRATION_MODE != 'mainnet') {
    timelockInstance = await Timelock.deployed();
    migrationHelperInstance = await MigrationHelper.deployed()
    //governanceInstance = await GovernorAlpha.deployed();
    arthInstance = await ARTHStablecoin.deployed();
    arthxInstance = await ARTHShares.deployed();
    wethInstance = await WETH.deployed();
    col_instance_USDC = await FakeCollateral_USDC.deployed();
    col_instance_USDT = await FakeCollateral_USDT.deployed();

    routerInstance = await UniswapV2Router02_Modified.deployed();
    uniswapFactoryInstance = await UniswapV2Factory.deployed();
    swapToPriceInstance = await SwapToPrice.deployed();
    oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.deployed();
    oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.deployed();
    oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.deployed();

    oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHS.deployed();
    oracle_instance_ARTHS_WETH = await UniswapPairOracle_ARTHS_WETH.deployed();
    oracle_instance_ARTHS_USDC = await UniswapPairOracle_ARTHS_USDC.deployed();
    oracle_instance_ARTHS_USDT = await UniswapPairOracle_ARTHS_USDT.deployed();

    oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.deployed();
    oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.deployed();

    stakingInstance_ARTH_WETH = await StakingRewards_ARTH_WETH.deployed();
    stakingInstance_ARTH_USDC = await StakingRewards_ARTH_USDC.deployed();
    stakingInstance_ARTH_ARTHX = await StakingRewards_ARTH_ARTHS.deployed();
    stakingInstance_ARTHS_WETH = await StakingRewards_ARTHS_WETH.deployed();
    pool_instance_USDC = await Pool_USDC.deployed();
    pool_instance_USDT = await Pool_USDT.deployed();

  }
  else {
    CONTRACT_ADDRESSES = constants.CONTRACT_ADDRESSES;
    timelockInstance = await Timelock.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].misc.timelock);
    migrationHelperInstance = await MigrationHelper.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].misc.migration_helper);
    arthInstance = await ARTHStablecoin.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].main.ARTH);
    arthxInstance = await ARTHShares.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].main.ARTHS);
    //governanceInstance = await GovernorAlpha.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].governance);
    wethInstance = await WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].weth);
    col_instance_USDC = await FakeCollateral_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].collateral.USDC);
    col_instance_USDT = await FakeCollateral_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].collateral.USDT);

    routerInstance = await UniswapV2Router02.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].uniswap_other.router);
    uniswapFactoryInstance = await UniswapV2Factory.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].uniswap_other.factory);
    swapToPriceInstance = await SwapToPrice.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pricing.swap_to_price);
    oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_WETH);
    oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_USDC);
    oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_USDT);

    oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHS.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_ARTHS);
    oracle_instance_ARTHS_WETH = await UniswapPairOracle_ARTHS_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTHS_WETH);
    oracle_instance_ARTHS_USDC = await UniswapPairOracle_ARTHS_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTHS_USDC);
    oracle_instance_ARTHS_USDT = await UniswapPairOracle_ARTHS_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTHS_USDT);

    oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.USDC_WETH);
    oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.USDT_WETH);

    stakingInstance_ARTH_WETH = await StakingRewards_ARTH_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/WETH"]);
    stakingInstance_ARTH_USDC = await StakingRewards_ARTH_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/USDC"]);
    stakingInstance_ARTH_ARTHX = await StakingRewards_ARTH_ARTHS.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/ARTHS"]);
    stakingInstance_ARTHS_WETH = await StakingRewards_ARTHS_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTHS/WETH"]);
    pool_instance_USDC = await Pool_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pools.USDC);
    pool_instance_USDT = await Pool_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pools.USDT);

  }

  // return false;

  // CONTINUE MAIN DEPLOY CODE HERE
  // ====================================================================================================================
  // ====================================================================================================================

  // ======== Initialize the staking rewards ========
  console.log(chalk.yellow.bold('======== Initialize the staking rewards ========'));
  await Promise.all([
    stakingInstance_ARTH_WETH.initializeDefault({ from: METAMASK_ADDRESS }),
    stakingInstance_ARTH_USDC.initializeDefault({ from: METAMASK_ADDRESS }),
  ])

  // console.log(chalk.blue('=== stakingInstance_ARTH_ARTHX ==='));
  // await stakingInstance_ARTH_ARTHS.initializeDefault({ from: STAKING_OWNER });
  // console.log(chalk.blue('=== stakingInstance_ARTHS_WETH ==='));
  // await stakingInstance_ARTHS_WETH.initializeDefault({ from: STAKING_OWNER });

  console.log(`==========================================================`);

};
