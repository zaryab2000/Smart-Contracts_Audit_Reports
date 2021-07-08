const chalk = require('chalk')
const { time } = require('@openzeppelin/test-helpers')

require('dotenv').config()


const Timelock = artifacts.require("Governance/Timelock")
// const MigrationHelper = artifacts.require("Utils/MigrationHelper")


module.exports = async function (deployer, network, accounts) {

  const DEPLOYER_ADDRESS = accounts[0]

  const timelockInstance = await Timelock.deployed()
  // const migrationHelperInstance = await MigrationHelper.deployed()

  if (process.env.MIGRATION_MODE == 'ganache' || network == 'development') {
    // Advance 2 days to catch things up.
    await time.increase((2 * 86400) + 300 + 1)
    await time.advanceBlock()
  }
  else {
    console.log(chalk.red.bold('\nYou need to wait atleast 2 Days here.'))
  }

  console.log(chalk.yellow('\nSet the GOVERNANCE CONTRACT as the timelock admin [Phase 2].'))

  // Fetch the delay transaction
  // const eta_with_delay = (await migrationHelperInstance.gov_to_timelock_eta.call()).toNumber()

  // const tx_nugget = [
  //   timelockInstance.address,
  //   0,
  //   "setPendingAdmin(address)",
  //   web3.eth.abi.encodeParameters(['address'], [governanceInstance.address]),
  //   eta_with_delay,
  //   { from: TIMELOCK_ADMIN }
  // ]

  // await timelockInstance.executeTransaction(...tx_nugget)
  // await governanceInstance.__acceptAdmin({ from: DEPLOYER_ADDRESS })
  timelock_admin_address = await timelockInstance.admin.call()
  console.log("NOTE: - timelock_admin [AFTER]: ", timelock_admin_address)
}
