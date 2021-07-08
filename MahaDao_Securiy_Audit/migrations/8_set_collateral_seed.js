const chalk = require('chalk')
const BigNumber = require('bignumber.js')

require('dotenv').config()
const helpers = require('./helpers')


const Pool_USDC = artifacts.require("Arth/Pools/Pool_USDC")
const Pool_USDT = artifacts.require("Arth/Pools/Pool_USDT")


module.exports = async function (deployer, network, accounts) {

  const DEPLOYER_ADDRESS = accounts[0]
  const ONE_HUNDRED_DEC6 = new BigNumber("100e6")
  const COLLATERAL_SEED_DEC6 = new BigNumber(508500e6)
  const ONE_HUNDRED_MILLION = new BigNumber("100000000e6")

  const pool_instance_USDC = await Pool_USDC.deployed()
  const pool_instance_USDT = await Pool_USDT.deployed()
  const col_instance_USDC = await helpers.getUSDC(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDC', 6)
  const col_instance_USDT = await helpers.getUSDT(network, deployer, artifacts, DEPLOYER_ADDRESS, ONE_HUNDRED_MILLION, 'USDT', 6)

  console.log(chalk.yellow("\nSeeding the collateral pools some collateral to start off with..."))
  if (helpers.isMainnet(network)) {
    await Promise.all([
      await col_instance_USDC.transfer(pool_instance_USDC.address, ONE_HUNDRED_DEC6, { from: DEPLOYER_ADDRESS }),
      await col_instance_USDT.transfer(pool_instance_USDT.address, ONE_HUNDRED_DEC6, { from: DEPLOYER_ADDRESS }),
    ])
  }
  else {
    await col_instance_USDC.transfer(pool_instance_USDC.address, COLLATERAL_SEED_DEC6, { from: DEPLOYER_ADDRESS })
    await col_instance_USDT.transfer(pool_instance_USDT.address, COLLATERAL_SEED_DEC6, { from: DEPLOYER_ADDRESS })
  }
}
