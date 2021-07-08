const chalk = require('chalk')
const BigNumber = require('bignumber.js')

require('dotenv').config()
const helpers = require('./helpers')


const ARTHShares = artifacts.require("ARTHX/ARTHShares")
const ARTHStablecoin = artifacts.require("Arth/ARTHStablecoin")
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
  const arthInstance = await ARTHStablecoin.deployed()
  const routerInstance = await helpers.getUniswapRouter(network, deployer, artifacts)
  const oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.deployed()
  const oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.deployed()
  const oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.deployed()
  const oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.deployed()
  const oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.deployed()
  const oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHX.deployed()
  const oracle_instance_ARTHX_WETH = await UniswapPairOracle_ARTHX_WETH.deployed()
  const oracle_instance_ARTHX_USDC = await UniswapPairOracle_ARTHX_USDC.deployed()
  const oracle_instance_ARTHX_USDT = await UniswapPairOracle_ARTHX_USDT.deployed()
  const wethInstance = await helpers.getWETH(network, deployer, artifacts, DEPLOYER_ADDRESS)
  const col_instance_USDC = await helpers.getUSDC(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDC', 6)
  const col_instance_USDT = await helpers.getUSDT(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDT', 6)

  // TODO: Not sure about the swapToPriceInstance.swapToPrice parameters
  return false

  console.log(chalk.yellow("\nApproving router..."))
  await Promise.all([
    wethInstance.approve(routerInstance.address, new BigNumber(2000000e18), { from: DEPLOYER_ADDRESS }),
    col_instance_USDC.approve(routerInstance.address, new BigNumber(2000000e18), { from: DEPLOYER_ADDRESS }),
    col_instance_USDT.approve(routerInstance.address, new BigNumber(2000000e18), { from: DEPLOYER_ADDRESS }),
    arthInstance.approve(routerInstance.address, new BigNumber(1000000e18), { from: DEPLOYER_ADDRESS }),
    arthxInstance.approve(routerInstance.address, new BigNumber(5000000e18), { from: DEPLOYER_ADDRESS })
  ])

  console.log(chalk.yellow("\nApproving swapToPrice..."))
  await Promise.all([
    wethInstance.approve(swapToPriceInstance.address, new BigNumber(2000000e18), { from: DEPLOYER_ADDRESS }),
    col_instance_USDC.approve(swapToPriceInstance.address, new BigNumber(2000000e18), { from: DEPLOYER_ADDRESS }),
    col_instance_USDT.approve(swapToPriceInstance.address, new BigNumber(2000000e18), { from: DEPLOYER_ADDRESS }),
    arthInstance.approve(swapToPriceInstance.address, new BigNumber(1000000e18), { from: DEPLOYER_ADDRESS }),
    arthxInstance.approve(swapToPriceInstance.address, new BigNumber(5000000e18), { from: DEPLOYER_ADDRESS })
  ])

  console.log(chalk.yellow("\nDoing swapToPrice..."))
  await swapToPriceInstance.swapToPrice(
    arthInstance.address,
    wethInstance.address,
    new BigNumber(3650e5),
    new BigNumber(1e6),
    new BigNumber(100e18),
    new BigNumber(100e18),
    DEPLOYER_ADDRESS,
    new BigNumber(2105300114),
    { from: DEPLOYER_ADDRESS }
  )
  console.log("ARTH / WETH swapped")

  await swapToPriceInstance.swapToPrice(
    arthInstance.address,
    col_instance_USDC.address,
    new BigNumber(1008e3),
    new BigNumber(997e3),
    new BigNumber(100e18),
    new BigNumber(100e18),
    DEPLOYER_ADDRESS,
    new BigNumber(2105300114),
    { from: DEPLOYER_ADDRESS }
  )
  console.log("ARTH / USDC swapped")

  await swapToPriceInstance.swapToPrice(
    arthInstance.address,
    col_instance_USDT.address,
    new BigNumber(990e3),
    new BigNumber(1005e3),
    new BigNumber(100e18),
    new BigNumber(100e18),
    DEPLOYER_ADDRESS,
    new BigNumber(2105300114),
    { from: DEPLOYER_ADDRESS }
  )

  await swapToPriceInstance.swapToPrice(
    arthxInstance.address,
    wethInstance.address,
    new BigNumber(1855e6),
    new BigNumber(1e6),
    new BigNumber(100e18),
    new BigNumber(100e18),
    DEPLOYER_ADDRESS,
    new BigNumber(2105300114),
    { from: DEPLOYER_ADDRESS }
  )

  await swapToPriceInstance.swapToPrice(
    arthxInstance.address,
    col_instance_USDC.address,
    new BigNumber(52e5),
    new BigNumber(1e6),
    new BigNumber(100e18),
    new BigNumber(100e18),
    DEPLOYER_ADDRESS,
    new BigNumber(2105300114),
    { from: DEPLOYER_ADDRESS }
  )

  await swapToPriceInstance.swapToPrice(
    arthxInstance.address,
    col_instance_USDT.address,
    new BigNumber(51e5),
    new BigNumber(1e6),
    new BigNumber(100e18),
    new BigNumber(100e18),
    DEPLOYER_ADDRESS,
    new BigNumber(2105300114),
    { from: DEPLOYER_ADDRESS }
  )

  console.log(chalk.red.bold('\nYou need to wait atleast 24hrs here, but setting the period to 1sec temporarily.'))
  console.log(chalk.yellow('\nSetting period to 1 sec.'))

  await Promise.all([
    oracle_instance_ARTH_WETH.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDC.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDT.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_ARTHX.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_WETH.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDC.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDT.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_USDC_WETH.setPeriod(1, { from: DEPLOYER_ADDRESS }),
    oracle_instance_USDT_WETH.setPeriod(1, { from: DEPLOYER_ADDRESS })
  ])

  console.log(chalk.yellow('\nUpdating the prices...'))

  await Promise.all([
    oracle_instance_ARTH_WETH.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDC.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDT.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_ARTHX.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_WETH.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDC.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDT.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_USDC_WETH.update({ from: DEPLOYER_ADDRESS }),
    oracle_instance_USDT_WETH.update({ from: DEPLOYER_ADDRESS })
  ])

  console.log(chalk.yellow('\nSetting the period back to 24 hrs...'))
  await Promise.all([
    oracle_instance_ARTH_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDC.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDT.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_ARTHX.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDC.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDT.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_USDC_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_USDT_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
  ])
}
