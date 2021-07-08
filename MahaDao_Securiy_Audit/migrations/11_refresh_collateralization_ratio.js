const chalk = require('chalk')
const { time } = require('@openzeppelin/test-helpers')

require('dotenv').config()


const ARTHStablecoin = artifacts.require("Arth/ARTHStablecoin")
const ARTHController = artifacts.require('ArthController')
const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH")
const UniswapPairOracle_USDT_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDT_WETH")
const UniswapPairOracle_ARTH_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_WETH")
const UniswapPairOracle_ARTH_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDC")
const UniswapPairOracle_ARTH_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDT")
const UniswapPairOracle_ARTH_ARTHX = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_ARTHX")
const UniswapPairOracle_ARTHX_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_WETH")
const UniswapPairOracle_ARTHX_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_USDC")
const UniswapPairOracle_ARTHX_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_USDT")


module.exports = async function (deployer, network, accounts) {

  const DEPLOYER_ADDRESS = accounts[0]

  const arthInstance = await ARTHStablecoin.deployed()
  const arthCollateralInstance = await ARTHController.deployed()
  const oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.deployed()
  const oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.deployed()
  const oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.deployed()
  const oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.deployed()
  const oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.deployed()
  const oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHX.deployed()
  const oracle_instance_ARTHX_WETH = await UniswapPairOracle_ARTHX_WETH.deployed()
  const oracle_instance_ARTHX_USDC = await UniswapPairOracle_ARTHX_USDC.deployed()
  const oracle_instance_ARTHX_USDT = await UniswapPairOracle_ARTHX_USDT.deployed()

  if (process.env.MIGRATION_MODE == 'ganache' || network == 'development') {
    // Advance a few seconds.
    await time.increase(86400 + 10 * 60)
    await time.advanceBlock()
  }
  else {
    console.log(chalk.red.bold('\nYou need to wait atleast 1 sec here'))

    // TODO: add a wait of 1 sec.
  }

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


  if (process.env.MIGRATION_MODE == 'ganache' || network == 'development') {
    // Advance 1 hr to catch things up.
    await time.increase(3600 + 1)
    await time.advanceBlock()
  }
  else {
    console.log(chalk.red.bold('\nYou need to wait atleast 2 days here.'))
  }

  await arthCollateralInstance.refreshCollateralRatio()
}
