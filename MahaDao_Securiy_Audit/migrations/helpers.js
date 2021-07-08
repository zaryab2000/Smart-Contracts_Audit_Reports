const chalk = require('chalk')
const BigNumber = require('bignumber.js')

const knownContracts = require('./known-contracts')


const ONE = new BigNumber('1e18')


const getDAI = async (network, deployer, artifacts, ownerAddr, genesisSupply, symbol, decimals) => {
  const IERC20 = artifacts.require('IERC20')
  const MockDai = artifacts.require('MockDAI')

  const addr = knownContracts.DAI && knownContracts.DAI[network]
  if (addr) return IERC20.at(addr)
  if (MockDai.isDeployed()) return MockDai.deployed()

  console.log(chalk.yellow(`\nDeploying mock dai on ${network} network...`))
  await deployer.deploy(MockDai, ownerAddr, genesisSupply, symbol, decimals)

  return MockDai.deployed()
}


const getWETH = async (network, deployer, artifacts, ownerAddr, genesisSupply, symbol, decimals) => {
  const IERC20 = artifacts.require('IERC20')
  const MockWETH = artifacts.require('MockWETH')

  const addr = knownContracts.WETH && knownContracts.WETH[network]
  if (addr) return IERC20.at(addr)
  if (MockWETH.isDeployed()) return MockWETH.deployed()

  console.log(chalk.yellow(`\nDeploying mock weth on ${network} network...`))
  await deployer.deploy(MockWETH, ownerAddr, genesisSupply, symbol, decimals)

  return MockWETH.deployed()
}


const getUSDC = async (network, deployer, artifacts, ownerAddr, genesisSupply, symbol, decimals) => {
  const IERC20 = artifacts.require('IERC20')
  const MockUSDC = artifacts.require('MockUSDC')

  const addr = knownContracts.USDC && knownContracts.USDC[network]
  if (addr) return IERC20.at(addr)
  if (MockUSDC.isDeployed()) return MockUSDC.deployed()

  console.log(chalk.yellow(`\nDeploying mock usdc on ${network} network...`))
  await deployer.deploy(MockUSDC, ownerAddr, genesisSupply, symbol, decimals)

  return MockUSDC.deployed()
}


const getUSDT = async (network, deployer, artifacts, ownerAddr, genesisSupply, symbol, decimals) => {
  const IERC20 = artifacts.require('IERC20')
  const MockUSDT = artifacts.require('MockUSDT')

  const addr = knownContracts.USDT && knownContracts.USDT[network]
  if (addr) return IERC20.at(addr)
  if (MockUSDT.isDeployed()) return MockUSDT.deployed()

  console.log(chalk.yellow(`\nDeploying mock dai on ${network} network...`))
  await deployer.deploy(MockUSDT, ownerAddr, genesisSupply, symbol, decimals)

  return MockUSDT.deployed()
}


const getMahaToken = async (network, deployer, artifacts) => {
  const IERC20 = artifacts.require('IERC20')
  const MahaToken = artifacts.require('MahaToken')

  const addr = knownContracts.MahaToken && knownContracts.MahaToken[network]
  if (addr) return IERC20.at(addr)

  if (MahaToken.isDeployed()) return MahaToken.deployed()

  console.log(chalk.yellow(`\nDeploying mahatoken on ${network} network...`))
  await deployer.deploy(MahaToken)

  return MahaToken.deployed()
}


const getUniswapFactory = async (network, deployer, artifacts) => {
  const UniswapV2Factory = artifacts.require('UniswapV2Factory')

  const addr = knownContracts.UniswapV2Factory && knownContracts.UniswapV2Factory[network]
  if (addr) return UniswapV2Factory.at(addr)

  if (UniswapV2Factory.isDeployed()) return UniswapV2Factory.deployed()

  console.log(chalk.yellow(`\nDeploying uniswap factory on ${network} network...`))
  await deployer.deploy(UniswapV2Factory, '0x0000000000000000000000000000000000000000')

  return UniswapV2Factory.deployed()
}


const getUniswapRouter = async (network, deployer, artifacts) => {
  const UniswapV2Router02 = artifacts.require('UniswapV2Router02')

  const addr = knownContracts.UniswapV2Router02 && knownContracts.UniswapV2Router02[network]
  if (addr) return UniswapV2Router02.at(addr)

  if (UniswapV2Router02.isDeployed()) return UniswapV2Router02.deployed()

  console.log(chalk.yellow(`\nDeploying uniswap router on ${network} network...`))
  const factory = await getUniswapFactory(network, deployer, artifacts)
  await deployer.deploy(UniswapV2Router02, factory.address, '0x0000000000000000000000000000000000000000')

  return UniswapV2Router02.deployed()
}


const approveIfNot = async (token, spender, amount) => {
  console.log(` - Approving ${token.symbol ? (await token.symbol()) : token.address}`)
  await token.approve(spender, amount)
  console.log(` - Approved ${token.symbol ? (await token.symbol()) : token.address}`)
}


const getPairAddress = async (token1, token2, network, deployer, artifacts) => {
  const factory = await getUniswapFactory(network, deployer, artifacts)

  return await factory.getPair(token1, token2)
}


const isMainnet = (network) => network === 'mainnet' || network === 'bsc' || network === 'matic' || network === 'heco'


const getGMUOracle = async (network, deployer, artifacts) => {
  const GMUOracle = artifacts.require('GMUOracle')

  const addr = knownContracts.GMUOracle && knownContracts.GMUOracle[network]
  if (addr) return GMUOracle.at(addr)

  if (GMUOracle.isDeployed()) return GMUOracle.deployed()

  console.log(chalk.yellow(`\nDeploying GMU/USD oracle...`))
  await deployer.deploy(GMUOracle, 'GMU/USD', ONE)

  return GMUOracle.deployed()
}


const getARTHMAHAOracle = async (network, deployer, artifacts) => {
  const ARTHMAHAOracle = artifacts.require('ARTHMAHAOracle')

  const addr = knownContracts.ARTHMAHAOracle && knownContracts.ARTHMAHAOracle[network]
  if (addr) return ARTHMAHAOracle.at(addr)

  if (ARTHMAHAOracle.isDeployed()) return ARTHMAHAOracle.deployed()

  console.log(chalk.yellow(`\nDeploying ARTH/MAHA oracle...`))
  await deployer.deploy(ARTHMAHAOracle, 'ARTH/MAHA', ONE)

  return ARTHMAHAOracle.deployed()
}


const getChainlinkETHUSDOracle = async (network, deployer, artifacts) => {
  const MockChainlinkOracle = artifacts.require('MockChainlinkAggregatorV3')
  const ChainlinkETHUSDPriceConsumer = artifacts.require('ChainlinkETHUSDPriceConsumer')

  const addr = knownContracts['ETHUSDChainlinkOracle'] && knownContracts.ETHUSDChainlinkOracle[network]
  if (addr) return ChainlinkETHUSDPriceConsumer.at(addr)

  if (ChainlinkETHUSDPriceConsumer.isDeployed()) return ChainlinkETHUSDPriceConsumer.deployed()

  let defaultChainlinkConsumerAddr = knownContracts.ETHUSDChainlinkOracleDefault[network]
  if (!defaultChainlinkConsumerAddr) {
    await deployer.deploy(MockChainlinkOracle)
    defaultChainlinkConsumerAddr = (await MockChainlinkOracle.deployed()).address
  }

  console.log(chalk.yellow(`\nDeploying Chainlink ETH/USD oracle...`))
  await deployer.deploy(ChainlinkETHUSDPriceConsumer, defaultChainlinkConsumerAddr, (await getGMUOracle(network, deployer, artifacts)).address)

  return ChainlinkETHUSDPriceConsumer.deployed()
}


module.exports = {
  isMainnet,
  getPairAddress,
  getDAI,
  getWETH,
  getUSDC,
  getUSDT,
  getMahaToken,
  approveIfNot,
  getUniswapFactory,
  getUniswapRouter,
  getGMUOracle,
  getARTHMAHAOracle,
  getChainlinkETHUSDOracle
}
