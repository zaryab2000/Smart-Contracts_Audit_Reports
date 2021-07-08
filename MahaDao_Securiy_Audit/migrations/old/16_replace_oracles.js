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
    // oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_WETH);
    // oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_USDC);
    // oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_USDT);

    // oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHS.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTH_ARTHS);
    // oracle_instance_ARTHS_WETH = await UniswapPairOracle_ARTHS_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTHS_WETH);
    // oracle_instance_ARTHS_USDC = await UniswapPairOracle_ARTHS_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTHS_USDC);
    // oracle_instance_ARTHS_USDT = await UniswapPairOracle_ARTHS_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.ARTHS_USDT);

    // oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.USDC_WETH);
    // oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].oracles.USDT_WETH);

    // stakingInstance_ARTH_WETH = await StakingRewards_ARTH_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/WETH"]);
    // stakingInstance_ARTH_USDC = await StakingRewards_ARTH_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/USDC"]);
    // stakingInstance_ARTH_ARTHX = await StakingRewards_ARTH_ARTHS.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/ARTHS"]);
    // stakingInstance_ARTHS_WETH = await StakingRewards_ARTHS_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTHS/WETH"]);
    pool_instance_USDC = await Pool_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pools.USDC);
    pool_instance_USDT = await Pool_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pools.USDT);

  }

  // CONTINUE MAIN DEPLOY CODE HERE
  // ====================================================================================================================
  // ====================================================================================================================

  // Have to do these since Truffle gets messy when you want to link already-deployed libraries
  console.log(chalk.yellow('========== LINK STUFF =========='));
  await deployer.deploy(Address);
  await deployer.deploy(Babylonian);
  await deployer.deploy(StringHelpers);
  await deployer.link(Babylonian, [FixedPoint, SwapToPrice]);
  await deployer.deploy(FixedPoint);
  await deployer.link(FixedPoint, [UniswapV2OracleLibrary, UniswapPairOracle_ARTH_WETH, UniswapPairOracle_ARTH_USDC, UniswapPairOracle_ARTH_USDT, UniswapPairOracle_ARTH_ARTHS, UniswapPairOracle_ARTHS_WETH, UniswapPairOracle_ARTHS_USDC, UniswapPairOracle_ARTHS_USDT, UniswapPairOracle_USDC_WETH, UniswapPairOracle_USDT_WETH]);
  await deployer.deploy(UniswapV2OracleLibrary);
  await deployer.link(UniswapV2OracleLibrary, [UniswapPairOracle_ARTH_WETH, UniswapPairOracle_ARTH_USDC, UniswapPairOracle_ARTH_USDT, UniswapPairOracle_ARTH_ARTHS, UniswapPairOracle_ARTHS_WETH, UniswapPairOracle_ARTHS_WETH, UniswapPairOracle_ARTHS_USDC, UniswapPairOracle_ARTHS_USDT, UniswapPairOracle_USDC_WETH, UniswapPairOracle_USDT_WETH]);
  await deployer.deploy(UniswapV2Library);
  await deployer.link(UniswapV2Library, [UniswapPairOracle_ARTH_WETH, UniswapPairOracle_ARTH_USDC, UniswapPairOracle_ARTH_USDT, UniswapPairOracle_ARTH_ARTHS, UniswapPairOracle_ARTHS_WETH, UniswapPairOracle_ARTHS_USDC, UniswapPairOracle_ARTHS_USDT, UniswapPairOracle_USDT_WETH, UniswapPairOracle_USDC_WETH]);

  // ======== Set the Uniswap oracles ========
  console.log(chalk.yellow('========== UNISWAP ORACLES =========='));
  console.log(chalk.blue('=== ARTH ORACLES ==='));
  await Promise.all([
    deployer.deploy(UniswapPairOracle_ARTH_WETH, uniswapFactoryInstance.address, arthInstance.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
    deployer.deploy(UniswapPairOracle_ARTH_USDC, uniswapFactoryInstance.address, arthInstance.address, col_instance_USDC.address, METAMASK_ADDRESS, timelockInstance.address),
    deployer.deploy(UniswapPairOracle_ARTH_USDT, uniswapFactoryInstance.address, arthInstance.address, col_instance_USDT.address, METAMASK_ADDRESS, timelockInstance.address),
    deployer.deploy(UniswapPairOracle_ARTH_ARTHS, uniswapFactoryInstance.address, arthInstance.address, arthxInstance.address, METAMASK_ADDRESS, timelockInstance.address)
  ]);

  console.log(chalk.blue('=== ARTHX ORACLES ==='));
  await Promise.all([
    deployer.deploy(UniswapPairOracle_ARTHS_WETH, uniswapFactoryInstance.address, arthxInstance.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
    deployer.deploy(UniswapPairOracle_ARTHS_USDC, uniswapFactoryInstance.address, arthxInstance.address, col_instance_USDC.address, METAMASK_ADDRESS, timelockInstance.address),
    deployer.deploy(UniswapPairOracle_ARTHS_USDT, uniswapFactoryInstance.address, arthxInstance.address, col_instance_USDT.address, METAMASK_ADDRESS, timelockInstance.address)
  ]);

  console.log(chalk.blue('=== COLLATERAL ORACLES ==='));
  await Promise.all([
    deployer.deploy(UniswapPairOracle_USDC_WETH, uniswapFactoryInstance.address, col_instance_USDC.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
    deployer.deploy(UniswapPairOracle_USDT_WETH, uniswapFactoryInstance.address, col_instance_USDT.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
  ]);

  // Get the instances
  oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.deployed();
  oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.deployed();
  oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.deployed();
  oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHS.deployed();
  oracle_instance_ARTHS_WETH = await UniswapPairOracle_ARTHS_WETH.deployed();
  oracle_instance_ARTHS_USDC = await UniswapPairOracle_ARTHS_USDC.deployed();
  oracle_instance_ARTHS_USDT = await UniswapPairOracle_ARTHS_USDT.deployed();
  oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.deployed();
  oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.deployed();

  // ============= Print the new oracles contracts ========
  const NEW_ORACLES = {
    oracles: {
      ARTH_WETH: oracle_instance_ARTH_WETH.address,
      ARTH_USDC: oracle_instance_ARTH_USDC.address,
      ARTH_USDT: oracle_instance_ARTH_USDT.address,
      ARTH_ARTHS: oracle_instance_ARTH_ARTHS.address,
      ARTHS_WETH: oracle_instance_ARTHS_WETH.address,
      ARTHS_USDC: oracle_instance_ARTHS_USDC.address,
      ARTHS_USDT: oracle_instance_ARTHS_USDT.address,
      USDC_WETH: oracle_instance_USDC_WETH.address,
      USDT_WETH: oracle_instance_USDT_WETH.address
    }
  }
  console.log("NEW ORACLES: ", NEW_ORACLES);


  // const NEW_ORACLES = {
  // 	oracles: {
  // 		ARTH_WETH: '0x30c271E2758fA59671106CC523708ddEaa188841',
  // 		ARTH_USDC: '0x9F1c425AE40908a071f003Ae604D7E421a289c8F',
  // 		ARTH_USDT: '0x395A3481Bf6ed9A9827D4dF25032dADd3432c3f4',
  // 		ARTH_ARTHS: '0x58258AEe794fb5eBD8B932cb4fA222DD4fcFcf62',
  // 		ARTHS_WETH: '0xf5B2514045F6B003A2A3eEb2b1e3dE7f8676979a',
  // 		ARTHS_USDC: '0x3860358A3A8EeAD5E1E47C8407fDAA571972A673',
  // 		ARTHS_USDT: '0x7A7c5b74911075778873B8aaD0f2F03bC108d31b',
  // 		USDC_WETH: '0x07a5fbD1829EfC4F1E698145fcD69b8235d30a81',
  // 		USDT_WETH: '0x4B7054C9AB4401DC25b5fD5fB602769eA8586A03'
  // 	  }
  // }


  // // ======== Link oracles ========
  // console.log(chalk.yellow('===== LINK ORACLES ====='));

  // // Link the oracles
  // console.log(chalk.blue('=== ARTH / WETH ORACLE SETTING ==='));
  // console.log(chalk.blue('=== COLLATERAL / WETH ORACLE SETTING ==='));
  // await Promise.all([
  // 	arthInstance.setARTHEthOracle(oracle_instance_ARTH_WETH.address, wethInstance.address, { from: COLLATERAL_ARTH_AND_ARTHS_OWNER }),
  // 	pool_instance_USDC.setCollatETHOracle(oracle_instance_USDC_WETH.address, wethInstance.address, { from: POOL_CREATOR }),
  // 	pool_instance_USDT.setCollatETHOracle(oracle_instance_USDT_WETH.address, wethInstance.address, { from: POOL_CREATOR })

  // ]);

  // // ======== Link ARTHX oracles ========
  // console.log(chalk.yellow('===== LINK ARTHX ORACLES ====='));

  // // Link the ARTHX oracles
  // await arthInstance.setARTHSEthOracle(oracle_instance_ARTHS_WETH.address, wethInstance.address, { from: COLLATERAL_ARTH_AND_ARTHS_OWNER });




  console.log(`==========================================================`);
};
