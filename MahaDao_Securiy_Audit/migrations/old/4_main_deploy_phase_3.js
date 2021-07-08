// const path = require('path');
// const envPath = path.join(__dirname, '../../.env');
// require('dotenv').config({ path: envPath });

// const constants = require(path.join(__dirname, '../src/types/constants'));

// const BigNumber = require('bignumber.js');
// // require('@openzeppelin/test-helpers/configure')({
// //   provider: process.env.NETWORK_ENDPOINT,
// // });

// const { expectEvent, send, shouldFail, time } = require('@openzeppelin/test-helpers');
// const BIG6 = new BigNumber("1e6");
// const BIG18 = new BigNumber("1e18");
// const chalk = require('chalk');

// const Address = artifacts.require("Utils/Address");
// const BlockMiner = artifacts.require("Utils/BlockMiner");
// const MigrationHelper = artifacts.require("Utils/MigrationHelper");
// const StringHelpers = artifacts.require("Utils/StringHelpers");
// const Math = artifacts.require("Math/Math");
// const SafeMath = artifacts.require("Math/SafeMath");
// const Babylonian = artifacts.require("Math/Babylonian");
// const FixedPoint = artifacts.require("Math/FixedPoint");
// const UQ112x112 = artifacts.require("Math/UQ112x112");
// const Owned = artifacts.require("Staking/Owned");
// const ERC20 = artifacts.require("ERC20/ERC20");
// const ERC20Custom = artifacts.require("ERC20/ERC20Custom");
// const SafeERC20 = artifacts.require("ERC20/SafeERC20");

// // Uniswap related
// const TransferHelper = artifacts.require("Uniswap/TransferHelper");
// const SwapToPrice = artifacts.require("Uniswap/SwapToPrice");
// const UniswapV2ERC20 = artifacts.require("Uniswap/UniswapV2ERC20");
// const UniswapV2Factory = artifacts.require("Uniswap/UniswapV2Factory");
// const UniswapV2Library = artifacts.require("Uniswap/UniswapV2Library");
// const UniswapV2OracleLibrary = artifacts.require("Uniswap/UniswapV2OracleLibrary");
// const UniswapV2Pair = artifacts.require("Uniswap/UniswapV2Pair");
// const UniswapV2Router02 = artifacts.require("Uniswap/UniswapV2Router02");
// const UniswapV2Router02_Modified = artifacts.require("Uniswap/UniswapV2Router02_Modified");

// // Collateral
// const WETH = artifacts.require("ERC20/WETH");
// const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");
// const FakeCollateral_USDT = artifacts.require("FakeCollateral/FakeCollateral_USDT");


// // Collateral Pools
// const ArthPoolLibrary = artifacts.require("Arth/Pools/ArthPoolLibrary");
// const Pool_USDC = artifacts.require("Arth/Pools/Pool_USDC");
// const Pool_USDT = artifacts.require("Arth/Pools/Pool_USDT");


// // Oracles
// const UniswapPairOracle_ARTH_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_WETH");
// const UniswapPairOracle_ARTH_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDC");
// const UniswapPairOracle_ARTH_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDT");

// const UniswapPairOracle_ARTH_ARTHX = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_ARTHS");
// const UniswapPairOracle_ARTHS_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_WETH");
// const UniswapPairOracle_ARTHS_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_USDC");
// const UniswapPairOracle_ARTHS_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHS_USDT");

// const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH");
// const UniswapPairOracle_USDT_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDT_WETH");


// // Chainlink Price Consumer
// const ChainlinkETHUSDPriceConsumer = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumer");
// const ChainlinkETHUSDPriceConsumerTest = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumerTest");

// // ARTH core
// const ARTHStablecoin = artifacts.require("Arth/ARTHStablecoin");
// const ARTHShares = artifacts.require("ARTHX/ARTHShares");
// const TokenVesting = artifacts.require("ARTHS/TokenVesting");

// // Governance related
// // const GovernorAlpha = artifacts.require("Governance/GovernorAlpha");
// const Timelock = artifacts.require("Governance/Timelock");

// // Staking contracts
// const StakingRewards_ARTH_WETH = artifacts.require("Staking/Variants/Stake_ARTH_WETH.sol");
// const StakingRewards_ARTH_USDC = artifacts.require("Staking/Variants/Stake_ARTH_USDC.sol");
// const StakingRewards_ARTH_ARTHX = artifacts.require("Staking/Variants/Stake_ARTH_ARTHS.sol");
// const StakingRewards_ARTHS_WETH = artifacts.require("Staking/Variants/Stake_ARTHS_WETH.sol");

// const MockMaha = artifacts.require("ERC20/MockMaha.sol");
// const ARTHMAHAOracle = artifacts.require("Oracle/ARTHMAHAOracle.sol");

// const DUMP_ADDRESS = "0x6666666666666666666666666666666666666666";

// // Make sure Ganache is running beforehand
// module.exports = async function (deployer, network, accounts) {

//   const IS_MAINNET = (process.env.MIGRATION_MODE == 'mainnet');
//   const IS_ROPSTEN = (process.env.MIGRATION_MODE == 'ropsten');

//   // ======== Set the addresses ========
//   console.log(chalk.yellow('===== SET THE ADDRESSES ====='));
//   const DEPLOYER_ADDRESS = accounts[0];
//   const COLLATERAL_ARTH_AND_ARTHS_OWNER = accounts[1];
//   const ORACLE_ADDRESS = accounts[2];
//   const POOL_CREATOR = accounts[3];
//   const TIMELOCK_ADMIN = accounts[4];
//   const GOVERNOR_GUARDIAN_ADDRESS = accounts[5];
//   const STAKING_OWNER = accounts[6];
//   const STAKING_REWARDS_DISTRIBUTOR = accounts[7];
//   // const COLLATERAL_ARTH_AND_ARTHS_OWNER = accounts[8];

//   // ======== Set other constants ========

//   const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
//   const DISTRIBUTION_AMOUNT = new BigNumber("100e18");
//   const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
//   const FIVE_MILLION_DEC6 = new BigNumber("5000000e6");
//   const TEN_MILLION_DEC18 = new BigNumber("10000000e18");
//   const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
//   const ONE_HUNDRED_MILLION_DEC6 = new BigNumber("100000000e6");
//   const ONE_BILLION_DEC18 = new BigNumber("1000000000e18");
//   const COLLATERAL_SEED_DEC18 = new BigNumber(508500e18);

//   // Starting seed amounts
//   const ARTH_SEED_AMOUNT_DEC18 = new BigNumber("10000e18");
//   const ARTHS_SEED_AMOUNT_DEC18 = new BigNumber("10000e18");

//   const redemptionFee = 400; // 0.04%
//   const mintingFee = 300; // 0.03%
//   const COLLATERAL_PRICE = 1040000; // $1.04
//   const TIMELOCK_DELAY = 2 * 86400; // 2 days
//   const DUMP_ADDRESS = "0x6666666666666666666666666666666666666666";
//   const METAMASK_ADDRESS = process.env.METAMASK_ADDRESS;;

//   // Print the addresses
//   // ================= Start Initializing =================

//   // Get the necessary instances
//   let CONTRACT_ADDRESSES;
//   let timelockInstance;
//   let migrationHelperInstance;
//   let arthInstance;
//   let arthxInstance;
//   let governanceInstance;
//   let wethInstance;
//   let col_instance_USDC;
//   let col_instance_USDT;
//   let routerInstance;
//   let uniswapFactoryInstance;
//   let swapToPriceInstance;
//   let stakingInstance_ARTH_WETH;
//   let stakingInstance_ARTH_USDC;
//   let stakingInstance_ARTH_ARTHS;
//   let stakingInstance_ARTHS_WETH;
//   let pair_instance_ARTH_WETH;
//   let pair_instance_ARTH_USDC;
//   let pair_instance_ARTH_ARTHS;
//   let pair_instance_ARTHS_WETH;
//   let mock_maha_stability_token;
//   let arth_maha_oracle;

//   if (process.env.MIGRATION_MODE != 'mainnet') {
//     timelockInstance = await Timelock.deployed();
//     migrationHelperInstance = await MigrationHelper.deployed()
//     //governanceInstance = await GovernorAlpha.deployed();
//     arthInstance = await ARTHStablecoin.deployed();
//     arthxInstance = await ARTHShares.deployed();
//     wethInstance = await WETH.deployed();
//     col_instance_USDC = await FakeCollateral_USDC.deployed();
//     col_instance_USDT = await FakeCollateral_USDT.deployed();
//     routerInstance = await UniswapV2Router02_Modified.deployed();
//     uniswapFactoryInstance = await UniswapV2Factory.deployed();
//     swapToPriceInstance = await SwapToPrice.deployed();
//     stakingInstance_ARTH_WETH = await StakingRewards_ARTH_WETH.deployed();
//     stakingInstance_ARTH_USDC = await StakingRewards_ARTH_USDC.deployed();
//     stakingInstance_ARTH_ARTHX = await StakingRewards_ARTH_ARTHS.deployed();
//     stakingInstance_ARTHS_WETH = await StakingRewards_ARTHS_WETH.deployed();
//     mock_maha_stability_token = await MockMaha.deployed();
//     arth_maha_oracle = await ARTHMAHAOracle.deployed();

//     const pair_addr_ARTH_WETH = await uniswapFactoryInstance.getPair(arthInstance.address, wethInstance.address, { from: METAMASK_ADDRESS });
//     const pair_addr_ARTH_USDC = await uniswapFactoryInstance.getPair(arthInstance.address, col_instance_USDC.address, { from: METAMASK_ADDRESS });
//     const pair_addr_ARTHS_WETH = await uniswapFactoryInstance.getPair(arthxInstance.address, wethInstance.address, { from: METAMASK_ADDRESS });
//     const pair_addr_ARTH_ARTHX = await uniswapFactoryInstance.getPair(arthInstance.address, arthxInstance.address, { from: METAMASK_ADDRESS });
//     pair_instance_ARTH_WETH = await UniswapV2Pair.at(pair_addr_ARTH_WETH);
//     pair_instance_ARTH_USDC = await UniswapV2Pair.at(pair_addr_ARTH_USDC);
//     pair_instance_ARTH_ARTHX = await UniswapV2Pair.at(pair_addr_ARTH_ARTHS);
//     pair_instance_ARTHS_WETH = await UniswapV2Pair.at(pair_addr_ARTHS_WETH);
//   }
//   else {
//     CONTRACT_ADDRESSES = constants.CONTRACT_ADDRESSES;
//     timelockInstance = await Timelock.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].misc.timelock);
//     migrationHelperInstance = await MigrationHelper.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].misc.migration_helper);
//     //governanceInstance = await GovernorAlpha.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].governance);
//     arthInstance = await ARTHStablecoin.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].main.ARTH);
//     arthxInstance = await ARTHShares.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].main.ARTHS);
//     wethInstance = await WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].weth);
//     col_instance_USDC = await FakeCollateral_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].collateral.USDC);
//     col_instance_USDT = await FakeCollateral_USDT.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].collateral.USDT);
//     routerInstance = await UniswapV2Router02.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].uniswap_other.router);
//     uniswapFactoryInstance = await UniswapV2Factory.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].uniswap_other.factory);
//     swapToPriceInstance = await SwapToPrice.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pricing.swap_to_price);
//     stakingInstance_ARTH_WETH = await StakingRewards_ARTH_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/WETH"]);
//     stakingInstance_ARTH_USDC = await StakingRewards_ARTH_USDC.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/USDC"]);
//     stakingInstance_ARTH_ARTHX = await StakingRewards_ARTH_ARTHS.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTH/ARTHS"]);
//     stakingInstance_ARTHS_WETH = await StakingRewards_ARTHS_WETH.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].staking_contracts["Uniswap ARTHS/WETH"]);
//     pair_instance_ARTH_WETH = await UniswapV2Pair.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pair_tokens["Uniswap ARTH/WETH"]);
//     pair_instance_ARTH_USDC = await UniswapV2Pair.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pair_tokens["Uniswap ARTH/USDC"]);
//     pair_instance_ARTH_ARTHX = await UniswapV2Pair.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pair_tokens["Uniswap ARTH/ARTHS"]);
//     pair_instance_ARTHS_WETH = await UniswapV2Pair.at(CONTRACT_ADDRESSES[process.env.MIGRATION_MODE].pair_tokens["Uniswap ARTHS/WETH"]);
//   }

//   // CONTINUE MAIN DEPLOY CODE HERE
//   // ====================================================================================================================
//   // ====================================================================================================================

//   // ======== Spread some ARTHX around ========
//   console.log(chalk.yellow('===== SPREAD SOME ARTHX AROUND ====='));

//   // Transfer ARTHX to staking contracts
//   console.log(chalk.yellow('===== Transfer ARTHX to staking contracts ====='));
//   await Promise.all([
//     arthxInstance.transfer(stakingInstance_ARTH_WETH.address, new BigNumber("6e18"), { from: METAMASK_ADDRESS }),
//     arthxInstance.transfer(stakingInstance_ARTH_USDC.address, new BigNumber("618"), { from: METAMASK_ADDRESS }),
//     arthxInstance.transfer(stakingInstance_ARTH_ARTHS.address, new BigNumber("10e18"), { from: METAMASK_ADDRESS }),
//     arthxInstance.transfer(stakingInstance_ARTHS_WETH.address, new BigNumber("10e18"), { from: METAMASK_ADDRESS })
//   ]);

//   if (!IS_MAINNET) {
//     // Advance 1 block so you can check the votes below
//     await time.increase(20);
//     await time.advanceBlock();
//   }

//   // Print some vote totals
//   console.log(chalk.yellow('===== PRINT OUT SOME VOTES ====='));

//   const previous_block = (await time.latestBlock()) - 1;

//   // Get the prices
//   // let stake_ARTH_WETH_votes = (new BigNumber(await arthxInstance.getPriorVotes.call(stakingInstance_ARTH_WETH.address, previous_block))).div(BIG18);
//   // let stake_ARTH_USDC_votes = (new BigNumber(await arthxInstance.getPriorVotes.call(stakingInstance_ARTH_USDC.address, previous_block))).div(BIG18);
//   // let stake_ARTH_ARTHS_votes = (new BigNumber(await arthxInstance.getPriorVotes.call(stakingInstance_ARTH_ARTHS.address, previous_block))).div(BIG18);
//   // let stake_ARTHS_WETH_votes = (new BigNumber(await arthxInstance.getPriorVotes.call(stakingInstance_ARTHS_WETH.address, previous_block))).div(BIG18);

//   // Print the new prices
//   // console.log("stake_ARTH_WETH_votes: ", stake_ARTH_WETH_votes.toString());
//   // console.log("stake_ARTH_USDC_votes: ", stake_ARTH_USDC_votes.toString());
//   // console.log("stake_ARTH_ARTHS_votes: ", stake_ARTH_ARTHS_votes.toString());
//   // console.log("stake_ARTHS_WETH_votes: ", stake_ARTHS_WETH_votes.toString());

//   // ======== Add liquidity to the pairs so the oracle constructor doesn't error  ========
//   // Initially, all prices will be 1:1, but that can be changed in further testing via arbitrage simulations to a known price
//   console.log(chalk.yellow('===== ADDING LIQUIDITY TO THE PAIRS ====='));

//   // const weth_balance_superowner = (new BigNumber(await wethInstance.balanceOf(COLLATERAL_ARTH_AND_ARTHS_OWNER))).div(BIG18).toNumber();
//   // console.log("weth_balance_superowner: ", weth_balance_superowner);

//   await Promise.all([
//     // ARTH / WETH
//     routerInstance.addLiquidity(
//       arthInstance.address,
//       wethInstance.address,
//       new BigNumber(600e18),
//       new BigNumber(1e18),
//       new BigNumber(600e18),
//       new BigNumber(1e18),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     ),
//     // ARTH / USDC
//     routerInstance.addLiquidity(
//       arthInstance.address,
//       col_instance_USDC.address,
//       new BigNumber(100e18),
//       new BigNumber(100e6),
//       new BigNumber(100e18),
//       new BigNumber(100e6),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     ),
//     // ARTH / USDT
//     routerInstance.addLiquidity(
//       arthInstance.address,
//       col_instance_USDT.address,
//       new BigNumber(100e18),
//       new BigNumber(100e6),
//       new BigNumber(100e18),
//       new BigNumber(100e6),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     ),
//     // ARTH / ARTHS
//     routerInstance.addLiquidity(
//       arthxInstance.address,
//       arthInstance.address,
//       new BigNumber(133333e15),
//       new BigNumber(100e18),
//       new BigNumber(133333e15),
//       new BigNumber(100e18),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     ),
//     // ARTHX / WETH
//     routerInstance.addLiquidity(
//       arthxInstance.address,
//       wethInstance.address,
//       new BigNumber(800e18),
//       new BigNumber(1e18),
//       new BigNumber(800e18),
//       new BigNumber(1e18),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     ),
//     // ARTHX / USDC
//     routerInstance.addLiquidity(
//       arthxInstance.address,
//       col_instance_USDC.address,
//       new BigNumber(133333e15),
//       new BigNumber(100e6),
//       new BigNumber(133333e15),
//       new BigNumber(100e6),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     ),
//     // ARTHX / USDT
//     routerInstance.addLiquidity(
//       arthxInstance.address,
//       col_instance_USDT.address,
//       new BigNumber(133333e15),
//       new BigNumber(100e6),
//       new BigNumber(133333e15),
//       new BigNumber(100e6),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     )
//   ]);


//   // These are already liquid on mainnet so no need to seed unless you are in the fake / test environment
//   if (!IS_MAINNET) {
//     // Handle USDC / WETH
//     await routerInstance.addLiquidity(
//       col_instance_USDC.address,
//       wethInstance.address,
//       new BigNumber(600000e6),
//       new BigNumber(1000e18),
//       new BigNumber(600000e6),
//       new BigNumber(1000e18),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     );

//     // Handle USDT / WETH
//     await routerInstance.addLiquidity(
//       col_instance_USDT.address,
//       wethInstance.address,
//       new BigNumber(600000e6),
//       new BigNumber(1000e18),
//       new BigNumber(600000e6),
//       new BigNumber(1000e18),
//       METAMASK_ADDRESS,
//       new BigNumber(2105300114),
//       { from: METAMASK_ADDRESS }
//     );
//   }

//   // ======== Set the Uniswap oracles ========
//   console.log(chalk.yellow('========== UNISWAP ORACLES =========='));
//   console.log(chalk.blue('=== ARTH ORACLES ==='));
//   await Promise.all([
//     deployer.deploy(UniswapPairOracle_ARTH_WETH, uniswapFactoryInstance.address, arthInstance.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
//     deployer.deploy(UniswapPairOracle_ARTH_USDC, uniswapFactoryInstance.address, arthInstance.address, col_instance_USDC.address, METAMASK_ADDRESS, timelockInstance.address),
//     deployer.deploy(UniswapPairOracle_ARTH_USDT, uniswapFactoryInstance.address, arthInstance.address, col_instance_USDT.address, METAMASK_ADDRESS, timelockInstance.address),
//     deployer.deploy(UniswapPairOracle_ARTH_ARTHS, uniswapFactoryInstance.address, arthInstance.address, arthxInstance.address, METAMASK_ADDRESS, timelockInstance.address)
//   ]);

//   console.log(chalk.blue('=== ARTHX ORACLES ==='));
//   await Promise.all([
//     deployer.deploy(UniswapPairOracle_ARTHS_WETH, uniswapFactoryInstance.address, arthxInstance.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
//     deployer.deploy(UniswapPairOracle_ARTHS_USDC, uniswapFactoryInstance.address, arthxInstance.address, col_instance_USDC.address, METAMASK_ADDRESS, timelockInstance.address),
//     deployer.deploy(UniswapPairOracle_ARTHS_USDT, uniswapFactoryInstance.address, arthxInstance.address, col_instance_USDT.address, METAMASK_ADDRESS, timelockInstance.address)
//   ]);

//   console.log(chalk.blue('=== COLLATERAL ORACLES ==='));
//   await Promise.all([
//     deployer.deploy(UniswapPairOracle_USDT_WETH, uniswapFactoryInstance.address, col_instance_USDT.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
//     deployer.deploy(UniswapPairOracle_USDC_WETH, uniswapFactoryInstance.address, col_instance_USDC.address, wethInstance.address, METAMASK_ADDRESS, timelockInstance.address),
//   ]);

//   // ============= Set the Arth Pools ========
//   console.log(chalk.yellow('========== ARTH POOLS =========='));
//   await deployer.link(StringHelpers, [Pool_USDC, Pool_USDT]);
//   await Promise.all([
//     deployer.deploy(Pool_USDC, arthInstance.address, arthxInstance.address, col_instance_USDC.address, METAMASK_ADDRESS, timelockInstance.address, mock_maha_stability_token.address, arth_maha_oracle.address, FIVE_MILLION_DEC6),
//     deployer.deploy(Pool_USDT, arthInstance.address, arthxInstance.address, col_instance_USDT.address, METAMASK_ADDRESS, timelockInstance.address, mock_maha_stability_token.address, arth_maha_oracle.address, FIVE_MILLION_DEC6)
//   ])

//   // ============= Get the pool instances ========
//   console.log(chalk.yellow('========== POOL INSTANCES =========='));
//   const pool_instance_USDC = await Pool_USDC.deployed();
//   const pool_instance_USDT = await Pool_USDT.deployed();

//   // ============= Set the redemption and minting fees ========
//   console.log(chalk.yellow('========== REDEMPTION AND MINTING FEES =========='));

//   // Set the redemption fee to 0.04%
//   // Set the minting fee to 0.03%
//   await Promise.all([
//     arthInstance.setRedemptionFee(redemptionFee, { from: METAMASK_ADDRESS }),
//     arthInstance.setMintingFee(mintingFee, { from: METAMASK_ADDRESS })
//   ])

//   // ============= Set the pool parameters so the minting and redemption fees get set ========
//   console.log(chalk.yellow('========== REFRESH POOL PARAMETERS =========='));
//   await Promise.all([
//     await pool_instance_USDC.setPoolParameters(FIVE_MILLION_DEC6, 7500, 1, 1, 1, 1, 1, { from: METAMASK_ADDRESS }),
//     await pool_instance_USDT.setPoolParameters(FIVE_MILLION_DEC6, 7500, 1, 1, 1, 1, 1, { from: METAMASK_ADDRESS }),
//   ]);

//   // ============= Get ARTH and ARTHX oracles ========
//   console.log(chalk.yellow('========== GET ARTH AND ARTHX ORACLES =========='));

//   // Get the instances
//   const oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.deployed();
//   const oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.deployed();
//   const oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.deployed();
//   const oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHS.deployed();
//   const oracle_instance_ARTHS_WETH = await UniswapPairOracle_ARTHS_WETH.deployed();
//   const oracle_instance_ARTHS_USDC = await UniswapPairOracle_ARTHS_USDC.deployed();
//   const oracle_instance_ARTHS_USDT = await UniswapPairOracle_ARTHS_USDT.deployed();
//   const oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.deployed();
//   const oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.deployed();


//   // ======== Set the Chainlink oracle ========
//   console.log(chalk.yellow('===== SET THE CHAINLINK ORACLE ====='));

//   // Initialize ETH-USD Chainlink Oracle too
//   let oracle_chainlink_ETH_USD;

//   // Add the ETH / USD Chainlink oracle
//   if (IS_MAINNET) {
//     oracle_chainlink_ETH_USD = await ChainlinkETHUSDPriceConsumer.at("0xBa6C6EaC41a24F9D39032513f66D738B3559f15a");
//     await arthInstance.setETHUSDOracle(oracle_chainlink_ETH_USD.address, { from: METAMASK_ADDRESS });
//   }
//   else {
//     oracle_chainlink_ETH_USD = await ChainlinkETHUSDPriceConsumerTest.deployed();
//     await arthInstance.setETHUSDOracle(oracle_chainlink_ETH_USD.address, { from: METAMASK_ADDRESS });
//   }


//   // ======== Link oracles ========
//   console.log(chalk.yellow('===== LINK ORACLES ====='));

//   // Link the oracles
//   console.log(chalk.blue('=== ARTH / WETH ORACLE SETTING ==='));
//   console.log(chalk.blue('=== COLLATERAL / WETH ORACLE SETTING ==='));
//   await Promise.all([
//     arthInstance.setARTHEthOracle(oracle_instance_ARTH_WETH.address, wethInstance.address, { from: METAMASK_ADDRESS }),
//     pool_instance_USDC.setCollatETHOracle(oracle_instance_USDC_WETH.address, wethInstance.address, { from: METAMASK_ADDRESS }),
//     pool_instance_USDT.setCollatETHOracle(oracle_instance_USDT_WETH.address, wethInstance.address, { from: METAMASK_ADDRESS })

//   ]);

//   // ======== Link ARTHX oracles ========
//   console.log(chalk.yellow('===== LINK ARTHX ORACLES ====='));

//   // Link the ARTHX oracles
//   await arthInstance.setARTHSEthOracle(oracle_instance_ARTHS_WETH.address, wethInstance.address, { from: METAMASK_ADDRESS });

//   // ======== Note the addresses ========
//   // If you are testing the frontend, you need to copy-paste the output of CONTRACT_ADDRESSES to the frontend src/misc/constants.tsx
//   let CONTRACT_ADDRESSES_PHASE_3 = {
//     [process.env.MIGRATION_MODE]: {
//       main: {
//         ARTH: arthInstance.address,
//         ARTHS: arthxInstance.address,
//         vesting: "NOT_DEPLOYED_YET"
//       },
//       weth: wethInstance.address,
//       oracles: {
//         ARTH_WETH: oracle_instance_ARTH_WETH.address,
//         ARTH_USDC: oracle_instance_ARTH_USDC.address,
//         ARTH_USDT: oracle_instance_ARTH_USDT.address,
//         ARTH_ARTHS: oracle_instance_ARTH_ARTHS.address,
//         ARTHS_WETH: oracle_instance_ARTHS_WETH.address,
//         ARTHS_USDC: oracle_instance_ARTHS_USDC.address,
//         ARTHS_USDT: oracle_instance_ARTHS_USDT.address,
//         USDC_WETH: oracle_instance_USDC_WETH.address,
//         USDT_WETH: oracle_instance_USDT_WETH.address,
//       },
//       collateral: {
//         USDC: col_instance_USDC.address,
//         USDT: col_instance_USDT.address,
//       },
//       //governance: governanceInstance.address,
//       pools: {
//         USDC: pool_instance_USDC.address,
//         USDT: pool_instance_USDT.address,
//       },
//       uniswap_other: {
//         router: routerInstance.address,
//         factory: uniswapFactoryInstance.address,
//       },
//       pricing: {
//         swap_to_price: swapToPriceInstance.address
//       },
//       misc: {
//         timelock: timelockInstance.address,
//         migration_helper: migrationHelperInstance.address
//       },
//       libraries: {
//         UniswapV2OracleLibrary: UniswapV2OracleLibrary.address,
//         UniswapV2Library: UniswapV2Library.address,
//         ArthPoolLibrary: ArthPoolLibrary.address,
//       },
//       pair_tokens: {
//         'Uniswap ARTH/WETH': pair_instance_ARTH_WETH.address,
//         'Uniswap ARTH/USDC': pair_instance_ARTH_USDC.address,
//         'Uniswap ARTH/ARTHS': pair_instance_ARTH_ARTHS.address,
//         'Uniswap ARTHS/WETH': pair_instance_ARTHS_WETH.address,
//       },
//       staking_contracts: {
//         'Uniswap ARTH/WETH': stakingInstance_ARTH_WETH.address,
//         'Uniswap ARTH/USDC': stakingInstance_ARTH_USDC.address,
//         'Uniswap ARTH/ARTHS': stakingInstance_ARTH_ARTHS.address,
//         'Uniswap ARTHS/WETH': stakingInstance_ARTHS_WETH.address,
//       }
//     }
//   }

//   console.log("CONTRACT_ADDRESSES: ", CONTRACT_ADDRESSES_PHASE_3);
// };
