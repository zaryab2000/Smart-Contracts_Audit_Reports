const chalk = require('chalk')
const { time } = require('@openzeppelin/test-helpers')

require('dotenv').config()
const helpers = require('./helpers')


const UniswapPairOracle_ARTH_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_WETH")
const UniswapPairOracle_ARTH_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDC")
const UniswapPairOracle_ARTH_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_USDT")
const UniswapPairOracle_ARTH_ARTHX = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTH_ARTHX")
const UniswapPairOracle_ARTHX_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_WETH")
const UniswapPairOracle_ARTHX_USDC = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_USDC")
const UniswapPairOracle_ARTHX_USDT = artifacts.require("Oracle/Variants/UniswapPairOracle_ARTHX_USDT")
const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH")
const UniswapPairOracle_USDT_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDT_WETH")


module.exports = async function (deployer, network, accounts) {

  const DEPLOYER_ADDRESS = accounts[0]


  const oracle_instance_ARTH_WETH = await UniswapPairOracle_ARTH_WETH.deployed()
  const oracle_instance_ARTH_USDC = await UniswapPairOracle_ARTH_USDC.deployed()
  const oracle_instance_ARTH_USDT = await UniswapPairOracle_ARTH_USDT.deployed()
  const oracle_instance_USDC_WETH = await UniswapPairOracle_USDC_WETH.deployed()
  const oracle_instance_USDT_WETH = await UniswapPairOracle_USDT_WETH.deployed()
  const oracle_instance_ARTH_ARTHX = await UniswapPairOracle_ARTH_ARTHX.deployed()
  const oracle_instance_ARTHX_WETH = await UniswapPairOracle_ARTHX_WETH.deployed()
  const oracle_instance_ARTHX_USDC = await UniswapPairOracle_ARTHX_USDC.deployed()
  const oracle_instance_ARTHX_USDT = await UniswapPairOracle_ARTHX_USDT.deployed()

  console.log(chalk.red.bold("\nNormally you'd need to wait 24 hrs here, but temporarily we set smaller duration"))
  // // Advance 24 hrs so the period can be computed.
  // await time.increase(86400 + 1)
  // await time.advanceBlock()

  console.log(chalk.yellow(' - Setting period to 1 sec temporarily'))
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

  console.log(chalk.yellow('\nUpdating oracle prices...'))
  if (process.env.MIGRATION_MODE == 'ganache' || network == 'development') {
    // Advance a few seconds.
    await time.increase(5)
    await time.advanceBlock()
  }
  else {
    console.log(chalk.red.bold('\nYou need to wait atleast 1 sec here.'))

    // TODO: add a wait time of 1 sec.
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

  console.log(chalk.yellow('\nSetting the oracle period back to 24 hrs...'))
  if (process.env.MIGRATION_MODE == 'ganache') {
    // Advance a few seconds.
    await time.increase(5)
    await time.advanceBlock()
  }
  else {
    console.log(chalk.red.bold('You need to wait atleast 1 second here.'))

    // TODO: add a wait time of 1 sec.
  }

  await Promise.all([
    oracle_instance_ARTH_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDC.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_USDT.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTH_ARTHX.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDC.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_ARTHX_USDT.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_USDC_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS }),
    oracle_instance_USDT_WETH.setPeriod(3600, { from: DEPLOYER_ADDRESS })
  ])
}
