const chalk = require('chalk')
const BigNumber = require('bignumber.js')
const { time } = require('@openzeppelin/test-helpers')

require('dotenv').config()
const helpers = require('./helpers')


const TokenVesting = artifacts.require("ARTHS/TokenVesting")


module.exports = async function (deployer, network, accounts) {

  const METAMASK_ADDRESS = accounts[0]

  console.log('Deploying Token vesting...')
  const theTime = await time.latest()
  if (helpers.isMainnet(network))
    await deployer.deploy(TokenVesting, METAMASK_ADDRESS, theTime, 86400 * 180, 86400 * 365, true, { from: METAMASK_ADDRESS })

  else await deployer.deploy(TokenVesting, METAMASK_ADDRESS, theTime, 86400, 86400 * 10, true, { from: METAMASK_ADDRESS })

  console.log('\nDeployments done...')
}
