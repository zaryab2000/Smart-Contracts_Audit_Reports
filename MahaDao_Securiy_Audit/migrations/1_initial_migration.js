const chalk = require('chalk')

const Migrations = artifacts.require("Util/Migrations")


module.exports = function (deployer, network, accounts) {

  console.log(chalk.yellow("\nUsing following accounts: "))
  console.log(accounts)

  deployer.deploy(Migrations)
}
