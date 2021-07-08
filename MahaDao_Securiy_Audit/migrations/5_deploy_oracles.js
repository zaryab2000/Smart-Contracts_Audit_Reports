const chalk = require('chalk')
const BigNumber = require('bignumber.js')

require('dotenv').config()
const helpers = require('./helpers')


const ARTHShares = artifacts.require("ARTHX/ARTHShares")
const Timelock = artifacts.require("Governance/Timelock")
const ARTHStablecoin = artifacts.require("Arth/ARTHStablecoin")
const ARTHController = artifacts.require("ArthController")
const UniswapPairOracle_ARTH_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_WETH")
const UniswapPairOracle_ARTH_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDC")
const UniswapPairOracle_ARTH_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDT")
const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH")
const UniswapPairOracle_USDT_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDT_WETH")
const UniswapPairOracle_ARTH_ARTHX = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_ARTHX")
const UniswapPairOracle_ARTHX_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_WETH")
const UniswapPairOracle_ARTHX_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_USDC")
const UniswapPairOracle_ARTHX_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_USDT")


module.exports = async function (deployer, network, accounts) {

  const DEPLOYER_ADDRESS = accounts[0]
  const ONE_HUNDRED_MILLION = new BigNumber("100000000e6")

  const arthxInstance = await ARTHShares.deployed()
  const timelockInstance = await Timelock.deployed()
  const arthInstance = await ARTHStablecoin.deployed()
  const arthController = await ARTHController.deployed()
  const wethInstance = await helpers.getWETH(network, deployer, artifacts, DEPLOYER_ADDRESS)
  const uniswapFactoryInstance = await helpers.getUniswapFactory(network, deployer, artifacts)
  const col_instance_USDC = await helpers.getUSDC(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDC', 6)
  const col_instance_USDT = await helpers.getUSDT(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDT', 6)

  console.log(chalk.yellow('\nDeploying uniswap oracles...'))
  console.log(chalk.yellow(' - Starting ARTH oracle...'))
  await Promise.all([
    deployer.deploy(
      UniswapPairOracle_ARTH_WETH,
      uniswapFactoryInstance.address,
      arthInstance.address,
      wethInstance.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    ),
    deployer.deploy(
      UniswapPairOracle_ARTH_USDC,
      uniswapFactoryInstance.address,
      arthInstance.address,
      col_instance_USDC.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    ),
    deployer.deploy(
      UniswapPairOracle_ARTH_USDT,
      uniswapFactoryInstance.address,
      arthInstance.address,
      col_instance_USDT.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    ),
    deployer.deploy(
      UniswapPairOracle_ARTH_ARTHX,
      uniswapFactoryInstance.address,
      arthInstance.address,
      arthxInstance.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    )
  ])

  console.log(chalk.yellow('- Starting ARTHX oracles...'))
  await Promise.all([
    deployer.deploy(
      UniswapPairOracle_ARTHX_WETH,
      uniswapFactoryInstance.address,
      arthxInstance.address,
      wethInstance.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    ),
    deployer.deploy(
      UniswapPairOracle_ARTHX_USDC,
      uniswapFactoryInstance.address,
      arthxInstance.address,
      col_instance_USDC.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    ),
    deployer.deploy(
      UniswapPairOracle_ARTHX_USDT,
      uniswapFactoryInstance.address,
      arthxInstance.address,
      col_instance_USDT.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    )
  ])

  console.log(chalk.yellow('- Starting with collateral oracles...'))
  await Promise.all([
    deployer.deploy(
      UniswapPairOracle_USDT_WETH,
      uniswapFactoryInstance.address,
      col_instance_USDT.address,
      wethInstance.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    ),
    deployer.deploy(
      UniswapPairOracle_USDC_WETH,
      uniswapFactoryInstance.address,
      col_instance_USDC.address,
      wethInstance.address,
      DEPLOYER_ADDRESS,
      timelockInstance.address
    ),
  ])

  await helpers.getGMUOracle(network, deployer, artifacts)
  await helpers.getARTHMAHAOracle(network, deployer, artifacts)
  const chainlinkETHUSDOracle = await helpers.getChainlinkETHUSDOracle(network, deployer, artifacts)

  console.log(chalk.yellow('\nSetting chainlink oracle...'))
  await arthController.setETHGMUOracle(chainlinkETHUSDOracle.address, { from: DEPLOYER_ADDRESS })

  console.log(chalk.yellow('\nSetting ARTHWETH oracle...'))
  const arthWETHOracle = await UniswapPairOracle_ARTH_WETH.deployed()
  await arthController.setARTHETHOracle(arthWETHOracle.address, wethInstance.address, { from: DEPLOYER_ADDRESS })

  const oracle_instance_ARTHX_WETH = await UniswapPairOracle_ARTHX_WETH.deployed()
  console.log(chalk.yellow('\nLinking ARTHX oracles...'))
  await arthController.setARTHXETHOracle(oracle_instance_ARTHX_WETH.address, wethInstance.address, { from: DEPLOYER_ADDRESS })
}
