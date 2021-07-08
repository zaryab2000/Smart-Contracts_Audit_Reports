const chalk = require('chalk')
const BigNumber = require('bignumber.js')

require('dotenv').config()
const helpers = require('./helpers')


const ARTHShares = artifacts.require("ARTHX/ARTHShares")
const ARTHController = artifacts.require("ArthController")
const Timelock = artifacts.require("Governance/Timelock")
const Pool_USDC = artifacts.require("Arth/Pools/Pool_USDC")
const Pool_USDT = artifacts.require("Arth/Pools/Pool_USDT")
const ArthPoolLibrary = artifacts.require("ArthPoolLibrary")
const ARTHStablecoin = artifacts.require("Arth/ARTHStablecoin")
const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH")
const UniswapPairOracle_USDT_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDT_WETH")


module.exports = async function (deployer, network, accounts) {

  const redemptionFee = 400 // 0.04%
  const mintingFee = 300 // 0.03%
  const DEPLOYER_ADDRESS = accounts[0]
  const TEN_MILLION = new BigNumber("1000000e6")
  const ONE_HUNDRED_MILLION = new BigNumber("100000000e6")

  const arthxInstance = await ARTHShares.deployed()
  const timelockInstance = await Timelock.deployed()
  const arthInstance = await ARTHStablecoin.deployed()
  const arthControllerInstance = await ARTHController.deployed()
  const mahaTokenInstance = await helpers.getMahaToken(network, deployer, artifacts)
  const arthMahaOracle = await helpers.getARTHMAHAOracle(network, deployer, artifacts)
  const wethInstance = await helpers.getWETH(network, deployer, artifacts, DEPLOYER_ADDRESS)
  const col_instance_USDC = await helpers.getUSDC(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDC', 6)
  const col_instance_USDT = await helpers.getUSDT(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDT', 6)

  console.log(chalk.yellow('\nDeploying and linking Pools library...'))
  await deployer.deploy(ArthPoolLibrary)
  await deployer.link(ArthPoolLibrary, [Pool_USDC, Pool_USDT]);

  console.log(chalk.yellow('\nDeploying Pools...'))
  await Promise.all([
    deployer.deploy(
      Pool_USDC,
      arthInstance.address,
      arthxInstance.address,
      col_instance_USDC.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address,
      mahaTokenInstance.address,
      arthMahaOracle.address,
      arthControllerInstance.address,
      TEN_MILLION
    ),
    deployer.deploy(
      Pool_USDT,
      arthInstance.address,
      arthxInstance.address,
      col_instance_USDT.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address,
      mahaTokenInstance.address,
      arthMahaOracle.address,
      arthControllerInstance.address,
      TEN_MILLION
    )
  ])

  console.log(chalk.yellow('\nGetting deployed Pool instances...'))
  const pool_instance_USDC = await Pool_USDC.deployed()
  const pool_instance_USDT = await Pool_USDT.deployed()

  console.log(chalk.yellow('\nSetting minting and redemtion fee...'))
  await Promise.all([
    arthControllerInstance.setMintingFee(mintingFee, { from: DEPLOYER_ADDRESS }),
    arthControllerInstance.setRedemptionFee(redemptionFee, { from: DEPLOYER_ADDRESS })
  ])

  console.log(chalk.yellow('\nRefreshing pool params...'))
  await Promise.all([
    await pool_instance_USDC.setPoolParameters(TEN_MILLION, 7500, 7500, 7500, 7500, 7500, { from: DEPLOYER_ADDRESS }),
    await pool_instance_USDT.setPoolParameters(TEN_MILLION, 7500, 7500, 7500, 7500, 7500, { from: DEPLOYER_ADDRESS }),
  ])

  console.log(chalk.yellow('\nGetting ARTH and ARTHX oracles...'))
  const oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.deployed()
  const oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.deployed()

  console.log(chalk.yellow('\nLinking Collateral oracles...'))
  await Promise.all([
    pool_instance_USDC.setCollatETHOracle(oracle_instance_USDC_WETH.address, wethInstance.address, { from: DEPLOYER_ADDRESS }),
    pool_instance_USDT.setCollatETHOracle(oracle_instance_USDT_WETH.address, wethInstance.address, { from: DEPLOYER_ADDRESS })
  ])
}
