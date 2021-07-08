const util = require('util')
const chalk = require('chalk')
const BigNumber = require('bignumber.js')
const Contract = require('web3-eth-contract')
const { expectRevert, time } = require('@openzeppelin/test-helpers')


Contract.setProvider('http://127.0.0.1:8545')


const MockUSDT = artifacts.require("MockUSDT")
const MockUSDC = artifacts.require("MockUSDC")
const MockWETH = artifacts.require("MockWETH")
const PoolUSDC = artifacts.require("Pool_USDC")
const PoolUSDT = artifacts.require("Pool_USDT")

const SwapToPrice = artifacts.require("SwapToPrice")
const UniswapV2Pair = artifacts.require("UniswapV2Pair")
const UniswapV2Factory = artifacts.require("UniswapV2Factory")
const UniswapV2Router02 = artifacts.require("UniswapV2Router02")

const UniswapPairOracleARTHUSDT = artifacts.require("UniswapPairOracle_ARTH_USDT")
const UniswapPairOracleARTHUSDC = artifacts.require("UniswapPairOracle_ARTH_USDC")
const UniswapPairOracleARTHWETH = artifacts.require("UniswapPairOracle_ARTH_WETH")
const UniswapPairOracleUSDTWETH = artifacts.require("UniswapPairOracle_USDT_WETH")
const UniswapPairOracleUSDCWETH = artifacts.require("UniswapPairOracle_USDC_WETH")
const UniswapPairOracle6DECWETH = artifacts.require("UniswapPairOracle_6DEC_WETH")
const UniswapPairOracleARTHXWETH = artifacts.require("UniswapPairOracle_ARTHX_WETH")
const UniswapPairOracleARTHXUSDT = artifacts.require("UniswapPairOracle_ARTHX_USDT")
const UniswapPairOracleARTHXUSDC = artifacts.require("UniswapPairOracle_ARTHX_USDC")
const ChainlinkETHUSDPriceConsumerTest = artifacts.require("ChainlinkETHUSDPriceConsumer")

const Timelock = artifacts.require("Timelock")
const ARTHXhares = artifacts.require("ARTHShares")
const ARTHStablecoin = artifacts.require("ARTHStablecoin")
const ARTHController = artifacts.require("ArthController")
const MahaToken = artifacts.require('MahaToken')
const TokenVesting = artifacts.require("TokenVesting.sol")
const StakingRewardsARTHUSDC = artifacts.require("Stake_ARTH_USDC.sol")
const StakingRewardsARTHWETH = artifacts.require("Stake_ARTH_WETH.sol")
const StakingRewardsARTHXWETH = artifacts.require("Stake_ARTHX_WETH.sol")


const BIG6 = new BigNumber("1e6")
const BIG18 = new BigNumber("1e18")
const ONE_THOUSAND_DEC18 = new BigNumber(1000e18)
const ONE_MILLION_DEC18 = new BigNumber(1000000e18)
const THREE_THOUSAND_DEC18 = new BigNumber(3000e18)
const COLLATERAL_SEED_DEC6 = new BigNumber(508500e6)
const COLLATERAL_SEED_DEC18 = new BigNumber(508500e18)

const TIMELOCK_DELAY = 86400 * 2 // 2 days
const REWARDS_DURATION = 7 * 86400 // 7 days
const DUMP_ADDRESS = "0x6666666666666666666666666666666666666666"
const METAMASK_ADDRESS = "0x6A24A4EcA5Ed225CeaE6895e071a74344E2853F5"

let totalSupplyARTH
let totalSupplyARTHX
let globalCollateralRatio
let globalCollateralValue


contract('ARTH', async (accounts) => {
    let COLLATERAL_ARTH_AND_ARTHX_OWNER
	let ORACLE_ADDRESS
	let POOL_CREATOR
	let TIMELOCK_ADMIN
	let GOVERNOR_GUARDIAN_ADDRESS
	let STAKING_OWNER
	let STAKING_REWARDS_DISTRIBUTOR

	let arthInstance
    let arthControllerInstance
	let arthxInstance
	let vestingInstance
	let wethInstance
	let usdcInstance
	let usdtInstance
	let mahaInstance

	let routerInstance
	let factoryInstance
    
    let usdcPoolInstance
	let usdtPoolInstance
	let timelockInstance
    let swapToPriceInstance
	
    let arthWETHOracleInstance
	let arthUSDCOracleInstance
	let arthUSDTOracleInstance
	let arthxWETHOracleInstance
	let arthxUSDCOracleInstance
	let arthxUSDTOracleInstance
	let ethGMUChainlinkInstance

	let arthWETHPairAddr
	let arthUSDCPairAddr
	let arthUSDTPairAddr
	let arthxWETHPairAddr
	let arthxUSDCPairAddr
	let arthxUSDTPairAddr
	
	let arthWETHPairInstance
	let arthUSDCPairInstance
	let arthUSDTPairInstance
	let arthxWETHPairInstance
	let arthxUSDCPairInstance
	let arthxUSDTPairInstance
	
	let arthFirstARTHWETH
	let arthFirstARTHUSDC
	let arthFirstARTHUSDT
	
	let arthxFirstARTHXWETH
	let arthxFirstARTHXUSDC
	let arthxFirstARTHXUSDT
    
    let arthUSDCStakingInstance
	let arthWETHStakingInstance
	let arthxWETHStakingInstance

    let cr = 1
	let balARTH = 0
	let balARTHX = 0
    let globalCr = 0
	let colBalUSDC = 0
    let poolBalUSDC = 0
	
	beforeEach(async () => {
		POOL_CREATOR = accounts[0]
		STAKING_OWNER = accounts[0]
        ORACLE_ADDRESS = accounts[0]
        TIMELOCK_ADMIN = accounts[0]
        GOVERNOR_GUARDIAN_ADDRESS = accounts[0]
        COLLATERAL_ARTH_AND_ARTHX_OWNER = accounts[0]
		STAKING_REWARDS_DISTRIBUTOR = accounts[0]

        arthxInstance = await ARTHXhares.deployed()
        vestingInstance = await TokenVesting.deployed()
        arthInstance = await ARTHStablecoin.deployed()
        arthControllerInstance = await ARTHController.deployed()
		mahaInstance = await MahaToken.deployed()

		wethInstance = await MockWETH.deployed()
		usdcInstance = await MockUSDC.deployed()
		usdtInstance = await MockUSDT.deployed()

        timelockInstance = await Timelock.deployed()
		routerInstance = await UniswapV2Router02.deployed()

		arthWETHOracleInstance = await UniswapPairOracleARTHWETH.deployed()
		arthUSDCOracleInstance = await UniswapPairOracleARTHUSDC.deployed()
		arthUSDTOracleInstance = await UniswapPairOracleARTHUSDT.deployed()
		arthxWETHOracleInstance = await UniswapPairOracleARTHXWETH.deployed()
		arthxUSDCOracleInstance = await UniswapPairOracleARTHXUSDC.deployed()
		arthxUSDTOracleInstance = await UniswapPairOracleARTHXUSDT.deployed()
		usdtWETHOracleInstance = await UniswapPairOracleUSDTWETH.deployed()
		usdcWETHOracleInstance = await UniswapPairOracleUSDCWETH.deployed()
		ethGMUChainlinkInstance = await ChainlinkETHUSDPriceConsumerTest.deployed()

		usdcPoolInstance = await PoolUSDC.deployed()
		usdtPoolInstance = await PoolUSDT.deployed()
        swapToPriceInstance = await SwapToPrice.deployed()
		uniswapFactoryInstance = await UniswapV2Factory.deployed()

		arthWETHPairAddr = await uniswapFactoryInstance.getPair(
            arthInstance.address, 
            MockWETH.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )
		arthUSDCPairAddr = await uniswapFactoryInstance.getPair(
            arthInstance.address,
            MockUSDC.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )
		arthUSDTPairAddr = await uniswapFactoryInstance.getPair(
            arthInstance.address,
            MockUSDT.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )
		arthxWETHPairAddr = await uniswapFactoryInstance.getPair(
            arthxInstance.address, 
            MockWETH.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )
		arthxUSDCPairAddr = await uniswapFactoryInstance.getPair(
            arthxInstance.address,
            MockUSDC.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )
		arthxUSDTPairAddr = await uniswapFactoryInstance.getPair(
            arthxInstance.address, 
            MockUSDT.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )
		usdtWETHPairAddr = await uniswapFactoryInstance.getPair(
            MockUSDT.address, 
            MockWETH.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )
		usdcWETHPairAddr = await uniswapFactoryInstance.getPair(
            MockUSDC.address,
            MockWETH.address, 
            { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
        )

		// Get instances of the pairs
		arthWETHPairInstance = await UniswapV2Pair.at(arthWETHPairAddr)
		arthUSDCPairInstance = await UniswapV2Pair.at(arthUSDCPairAddr)
		arthUSDTPairInstance = await UniswapV2Pair.at(arthUSDTPairAddr)
        usdtWETHPairInstance = await UniswapV2Pair.at(usdtWETHPairAddr)
		usdcWETHPairInstance = await UniswapV2Pair.at(usdcWETHPairAddr)
		arthxWETHPairInstance = await UniswapV2Pair.at(arthxWETHPairAddr)
		arthxUSDCPairInstance = await UniswapV2Pair.at(arthxUSDCPairAddr)
		arthxUSDTPairInstance = await UniswapV2Pair.at(arthxUSDTPairAddr)


		arthFirstARTHWETH = await arthWETHOracleInstance.token0()
		arthFirstARTHUSDC = await arthUSDCOracleInstance.token0()
		arthFirstARTHUSDT = await arthUSDTOracleInstance.token0()
		arthxFirstARTHXWETH = await arthxWETHOracleInstance.token0()
		arthxFirstARTHXUSDC = await arthxUSDCOracleInstance.token0()
		arthxFirstARTHXUSDT = await arthxUSDTOracleInstance.token0()

		arthFirstARTHWETH = arthInstance.address == arthFirstARTHWETH
		arthFirstARTHUSDC = arthInstance.address == arthFirstARTHUSDC
		arthFirstARTHUSDT = arthInstance.address == arthFirstARTHUSDT
		arthxFirstARTHXWETH = arthxInstance.address == arthxFirstARTHXWETH
		arthxFirstARTHXUSDC = arthxInstance.address == arthxFirstARTHXUSDC
		arthxFirstARTHXUSDT = arthxInstance.address == arthxFirstARTHXUSDT

		arthWETHStakingInstance = await StakingRewardsARTHWETH.deployed()
		arthUSDCStakingInstance = await StakingRewardsARTHUSDC.deployed()
		arthxWETHStakingInstance = await StakingRewardsARTHXWETH.deployed()
	})

	it('Check up on the oracles and make sure the prices are set', async () => {
		// Advance 24 hrs so the period can be computed
		await time.increase(86400 + 1)
		await time.advanceBlock()

		// Make sure the prices are updated
		await arthWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthUSDCOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthUSDTOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthxWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthxUSDCOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthxUSDTOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await usdtWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await usdcWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Get the prices
		// Price is in collateral needed for 1 ARTH
		let arthWETHARTHPrice = (new BigNumber(await arthWETHOracleInstance.consult.call(wethInstance.address, 1e6))).div(BIG6).toNumber()
		let arthUSDCARTHPrice = (new BigNumber(await arthUSDCOracleInstance.consult.call(MockUSDC.address, 1e6))).div(BIG6).toNumber()
		let arthUSDTARTHPrice = (new BigNumber(await arthUSDTOracleInstance.consult.call(MockUSDT.address, 1e6))).div(BIG6).toNumber()
		let arthxWETHARTHXPrice = (new BigNumber(await arthxWETHOracleInstance.consult.call(wethInstance.address, 1e6))).div(BIG6).toNumber()
		let arthxUSDCARTHXPrice = (new BigNumber(await arthxUSDCOracleInstance.consult.call(MockUSDC.address, 1e6))).div(BIG6).toNumber()
		let arthxUSDTARTHXPrice = (new BigNumber(await arthxUSDTOracleInstance.consult.call(MockUSDT.address, 1e6))).div(BIG6).toNumber()
		let usdtWETHUSDTPrice = (new BigNumber(await usdtWETHOracleInstance.consult.call(MockWETH.address, 1e6))).div(1e6).toNumber()
		let usdcWETHUSDCPrice = (new BigNumber(await usdcWETHOracleInstance.consult.call(MockWETH.address, 1e6))).div(1e6).toNumber()

		// Add allowances to the Uniswap Router
		await wethInstance.approve(routerInstance.address, new BigNumber(2000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await usdcInstance.approve(routerInstance.address, new BigNumber(2000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await usdtInstance.approve(routerInstance.address, new BigNumber(2000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthInstance.approve(routerInstance.address, new BigNumber(1000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthxInstance.approve(routerInstance.address, new BigNumber(5000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		await wethInstance.approve(swapToPriceInstance.address, new BigNumber(2000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await usdcInstance.approve(swapToPriceInstance.address, new BigNumber(2000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await usdtInstance.approve(swapToPriceInstance.address, new BigNumber(2000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthInstance.approve(swapToPriceInstance.address, new BigNumber(1000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthxInstance.approve(swapToPriceInstance.address, new BigNumber(5000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Get the prices
		arthWETHARTHPrice = (new BigNumber(await arthWETHOracleInstance.consult.call(wethInstance.address, 1e6))).div(BIG6).toNumber()
		arthUSDCARTHPrice = (new BigNumber(await arthUSDCOracleInstance.consult.call(MockUSDC.address, 1e6))).div(BIG6).toNumber()
		arthUSDTARTHPrice = (new BigNumber(await arthUSDTOracleInstance.consult.call(MockUSDT.address, 1e6))).div(BIG6).toNumber()
		arthxWETHARTHXPrice = (new BigNumber(await arthxWETHOracleInstance.consult.call(wethInstance.address, 1e6))).div(BIG6).toNumber()
		arthxUSDCARTHXPrice = (new BigNumber(await arthxUSDCOracleInstance.consult.call(MockUSDC.address, 1e6))).div(BIG6).toNumber()
		arthxUSDTARTHXPrice = (new BigNumber(await arthxUSDTOracleInstance.consult.call(MockUSDT.address, 1e6))).div(BIG6).toNumber()
		usdtWETHUSDTPrice = (new BigNumber(await usdtWETHOracleInstance.consult.call(MockWETH.address, 1e6))).div(1e6).toNumber()
		usdcWETHUSDCPrice = (new BigNumber(await usdcWETHOracleInstance.consult.call(MockWETH.address, 1e6))).div(1e6).toNumber()
	})

	it("Mints 1-to-1", async () => {
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()

		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()

		// Note the collateral and ARTH amounts before minting
		const arthBefore = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralBefore = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralBefore = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		const collateralPrice = (new BigNumber(await usdtPoolInstance.getCollateralPrice.call()).div(BIG6)).toNumber()

		balARTH = arthBefore
		colBalUSDT = collateralBefore
		poolBalUSDT = poolCollateralBefore

		// Need to approve first so the pool contract can use transferFrom
		const collateralAmount = new BigNumber("100e6")
		await usdtInstance.approve(usdtPoolInstance.address, collateralAmount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		
        // Mint some ARTH
		console.log("accounts[0] mint1t1ARTH() with 100 6DEC slippage limit of 1%")
		const ARTHOutMin = new BigNumber(collateralAmount.times(collateralPrice).times(0.99)) // 1% slippage
		await usdtPoolInstance.mint1t1ARTH(collateralAmount, ARTHOutMin, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Note the collateral and ARTH amounts after minting
		const arthAfter = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralAfter = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralAfter = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		
        // assert.equal(arthAfter, 103.9584)
		// assert.equal(collateralAfter, 8999900)
		// assert.equal(poolCollateralAfter, 1000100)
		
        console.log("accounts[0] arth change: ", arthAfter.toNumber() - arthBefore.toNumber())
		console.log("accounts[0] collateral change: ", collateralAfter.toNumber() - collateralBefore.toNumber())
		console.log("ARTH_pool_USDT collateral change: ", poolCollateralAfter.toNumber() - poolCollateralBefore.toNumber())

		// Note the new collateral ratio
		const crAfter = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("crAfter: ", crAfter.toNumber())
	})

	it("Redeems 6DEC 1-to-1", async () => {
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()

		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()

		console.log("ARTH price (USD): ", (new BigNumber(await arthControllerInstance.getARTHPrice.call()).div(BIG6)).toNumber())
		console.log("ARTHX price (USD): ", (new BigNumber(await arthControllerInstance.getARTHXPrice.call()).div(BIG6)).toNumber())
		console.log("totalSupplyARTH: ", totalSupplyARTH)
		console.log("totalSupplyARTHX: ", totalSupplyARTHX)
		console.log("globalCollateralRatio: ", globalCollateralRatio)
		console.log("globalCollateralValue: ", globalCollateralValue)
		console.log("")

		// Note the collateral and ARTH amounts before redeeming
		const collateralBefore = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralBefore = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		const arthBefore = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		
        balARTH = arthBefore
		colBalUSDT = collateralBefore
		poolBalUSDT = poolCollateralBefore
		console.log("balARTH: ", balARTH.toNumber())
		console.log("colBalUSDT: ", colBalUSDT.toNumber())
		console.log("poolBalUSDT: ", poolBalUSDT.toNumber())
		console.log("ARTH price (USD): ", new BigNumber(await arthControllerInstance.getARTHPrice.call()).div(BIG6).toNumber())

		// Need to approve first so the pool contract can use transfer
		const arth_amount = new BigNumber("100e18")
		const burn_amount = new BigNumber("100e18")
		await mahaInstance.approve(usdtPoolInstance.address, burn_amount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthInstance.approve(usdtPoolInstance.address, arth_amount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Redeem some ARTH
		await usdtPoolInstance.redeem1t1ARTH(arth_amount, new BigNumber("10e6"), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER }) // Get at least 10 6DEC out, roughly 90% slippage limit (testing purposes)
		console.log("accounts[0] redeem1t1() with 100 ARTH")
		// Collect redemption need to wait at least 3 blocks
		await time.advanceBlock()
		await time.advanceBlock()
		await time.advanceBlock()

		// Advance 24 hrs so the period can be computed
		await time.increase(86400 + 1)
		await time.advanceBlock()

		await usdtPoolInstance.collectRedemption({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Note the collateral and ARTH amounts after redeeming
		const collateralAfter = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const arthAfter = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const poolCollateralAfter = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		console.log("accounts[0] ARTH change: ", arthAfter.toNumber() - arthBefore.toNumber())
		console.log("accounts[0] 6DEC change: ", collateralAfter.toNumber() - collateralBefore.toNumber())
		console.log("ARTH_pool_6DEC change: ", poolCollateralAfter.toNumber() - poolCollateralBefore.toNumber())

		// Note the new collateral ratio
		const crAfter = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("crAfter: ", crAfter.toNumber())
	})


	// REDUCE COLLATERAL RATIO
	it("Reduces the collateral ratio: 1-to-1 Phase => Fractional Phase", async () => {
		// Add allowances to the swapToPrice contract
		await wethInstance.approve(swapToPriceInstance.address, new BigNumber(2000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		await arthInstance.approve(swapToPriceInstance.address, new BigNumber(1000000e18), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		await time.increase(86400 + 1)
		await time.advanceBlock()

		// Make sure the price is updated
		await arthWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })


		// Print the current ARTH price
		arthWETHARTHPrice = (new BigNumber(await arthWETHOracleInstance.consult.call(wethInstance.address, 1e6))).div(BIG6).toNumber()
		console.log("arthWETHARTHPrice (before): ", arthWETHARTHPrice.toString(), " ARTH = 1 MockWETH")

		// Advance 24 hrs so the period can be computed
		await time.increase(86400 + 1)
		await time.advanceBlock()

		// Make sure the price is updated
		await arthWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Swap the ARTH price upwards
		// Targeting 350 ARTH / 1 MockWETH
		await swapToPriceInstance.swapToPrice(
			arthInstance.address,
			wethInstance.address,
			new BigNumber(350e6),
			new BigNumber(1e6),
			new BigNumber(100e18),
			new BigNumber(100e18),
			COLLATERAL_ARTH_AND_ARTHX_OWNER,
			new BigNumber(2105300114),
			{ from: COLLATERAL_ARTH_AND_ARTHX_OWNER }
		)

		// Advance 24 hrs so the period can be computed
		await time.increase(86400 + 1)
		await time.advanceBlock()

		// Make sure the price is updated
		await arthWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Print the new ARTH price
		arthWETHARTHPrice = (new BigNumber(await arthWETHOracleInstance.consult.call(wethInstance.address, 1e6))).div(BIG6).toNumber()
		console.log("arthWETHARTHPrice (after): ", arthWETHARTHPrice.toString(), " ARTH = 1 MockWETH")

		// Advance 24 hrs so the period can be computed
		await time.increase(86400 + 1)
		await time.advanceBlock()

		// Make sure the price is updated
		await arthWETHOracleInstance.update({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		for (let i = 0; i < 13; i++) { // Drop the collateral ratio by 13 * 0.25%
			await time.increase(3600 + 1)
			await time.advanceBlock()
			await arthControllerInstance.refreshCollateralRatio()
			console.log("globalCollateralRatio:", (new BigNumber(await arthControllerInstance.globalCollateralRatio.call()).div(BIG6)).toNumber())
		}
	})

	it('Mint some ARTH using ARTHX and 6DEC (collateral ratio between .000001 and .999999) [mintFractionalARTH]', async () => {
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()
		console.log("ARTH price (USD): ", (new BigNumber(await arthControllerInstance.getARTHPrice.call()).div(BIG6)).toNumber())
		console.log("ARTHX price (USD): ", (new BigNumber(await arthControllerInstance.getARTHXPrice.call()).div(BIG6)).toNumber())
		console.log("totalSupplyARTH: ", totalSupplyARTH)
		console.log("totalSupplyARTHX: ", totalSupplyARTHX)
		console.log("globalCollateralRatio: ", globalCollateralRatio)
		console.log("globalCollateralValue: ", globalCollateralValue)
		console.log("")

		// console.log("accounts[0] votes intial:", (await arthxInstance.getCurrentVotes(COLLATERAL_ARTH_AND_ARTHX_OWNER)).toString())
		// Note the collateral ratio
		const collateral_ratio_before = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("collateral_ratio_before: ", collateral_ratio_before.toNumber())

		// Note the ARTHX, ARTH, and FAKE amounts before minting
		const arthx_before = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthBefore = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralBefore = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralBefore = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		
        balARTHX = arthx_before
		balARTH = arthBefore
		colBalUSDT = collateralBefore
		poolBalUSDT = poolCollateralBefore
		console.log("balARTHX: ", balARTHX.toNumber())
		console.log("balARTH: ", balARTH.toNumber())
		console.log("colBalUSDT: ", colBalUSDT.toNumber())
		console.log("poolBalUSDT: ", poolBalUSDT.toNumber())

		// Need to approve first so the pool contract can use transferFrom
		const arthxAmount = new BigNumber("500e18")
		await arthxInstance.approve(usdtPoolInstance.address, arthxAmount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		const collateralAmount = new BigNumber("100e6")
		await usdtInstance.approve(usdtPoolInstance.address, collateralAmount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		await usdtPoolInstance.mintFractionalARTH(collateralAmount, arthxAmount, new BigNumber("10e18"), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		console.log("accounts[0] mintFractionalARTH() with 100 6DEC and 500 ARTHX")

		// Note the ARTHX, ARTH, and FAKE amounts after minting
		const arthx_after = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthAfter = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralAfter = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralAfter = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		console.log("accounts[0] 6DEC balance change: ", collateralAfter.toNumber() - collateralBefore.toNumber())
		console.log("accounts[0] ARTHX balance change: ", arthx_after.toNumber() - arthx_before.toNumber())
		// console.log("accounts[0] votes final:", (await arthxInstance.getCurrentVotes(COLLATERAL_ARTH_AND_ARTHX_OWNER)).toString())
		console.log("accounts[0] ARTH balance change: ", arthAfter.toNumber() - arthBefore.toNumber())
		console.log("ARTH_pool_6DEC balance change: ", poolCollateralAfter.toNumber() - poolCollateralBefore.toNumber())

		// Note the new collateral ratio
		const crAfter = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("crAfter: ", crAfter.toNumber())
		//await expectRevert(arthxInstance.balanceOf(COLLATERAL_ARTH_AND_ARTHX_OWNER)) //throw error on purpose (to check event log)

	})

	it('Redeem some ARTH for ARTHX and 6DEC (collateral ratio between .000001 and .999999) [redeemFractionalARTH]', async () => {
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()

		// Note the collateral ratio
		const collateral_ratio_before = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("collateral_ratio_before: ", collateral_ratio_before.toNumber())

		// Note the ARTHX, ARTH, and FAKE amounts before redeeming
		const arthx_before = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthBefore = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralBefore = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralBefore = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		
		balARTHX = arthx_before
		balARTH = arthBefore
		colBalUSDT = collateralBefore
		poolBalUSDT = poolCollateralBefore
		console.log("accounts[0] ARTHX balance:", balARTH.toNumber())
		console.log("accounts[0] ARTH balance:", balARTH.toNumber())
		console.log("accounts[0] 6DEC balance", colBalUSDT.toNumber())
		console.log("ARTH_pool_6DEC balance:", poolBalUSDT.toNumber())

		// Need to approve first so the pool contract can use transfer
		const arth_amount = new BigNumber("135242531948024e6")
		await arthInstance.approve(usdtPoolInstance.address, arth_amount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Redeem some ARTH
		await usdtPoolInstance.redeemFractionalARTH(arth_amount, new BigNumber("10e18"), new BigNumber("10e6"), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		console.log("accounts[0] redeemFractionalARTH() with 135.24253 ARTH")
		// Collect redemption
		await time.advanceBlock()
		await time.advanceBlock()
		await time.advanceBlock()
		await usdtPoolInstance.collectRedemption({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Note the ARTHX, ARTH, and FAKE amounts after redeeming
		const arthx_after = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthAfter = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralAfter = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralAfter = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		console.log("accounts[0] ARTHX balance change:", arthx_after.toNumber() - arthx_before.toNumber())
		console.log("accounts[0] votes final:", (await arthxInstance.getCurrentVotes(COLLATERAL_ARTH_AND_ARTHX_OWNER)).toString())
		console.log("accounts[0] ARTH balance change:", arthAfter.toNumber() - arthBefore.toNumber())
		console.log("accounts[0] 6DEC balance change:", collateralAfter.toNumber() - collateralBefore.toNumber())
		console.log("ARTH_pool_6DEC balance change:", poolCollateralAfter.toNumber() - poolCollateralBefore.toNumber())

		// Note the new collateral ratio
		const crAfter = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("crAfter: ", crAfter.toNumber())
	})

	it('Recollateralizes the system using recollateralizeARTH()', async () => {
		let totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		let totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		let globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		let globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()
		console.log("ARTH price (USD): ", (new BigNumber(await arthControllerInstance.getARTHPrice.call()).div(BIG6)).toNumber())
		console.log("ARTHX price (USD): ", (new BigNumber(await arthControllerInstance.getARTHXPrice.call()).div(BIG6)).toNumber())
		console.log("totalSupplyARTH: ", totalSupplyARTH)
		console.log("totalSupplyARTHX: ", totalSupplyARTHX)
		console.log("globalCollateralRatio: ", globalCollateralRatio)
		console.log("globalCollateralValue: ", globalCollateralValue)
		console.log("")

		// Note the new collateral ratio
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()

		console.log("effective collateral ratio before:", globalCollateralValue / totalSupplyARTH)

		// Note the ARTHX, ARTH, and FAKE amounts before redeeming
		const arthx_before = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthBefore = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralBefore = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralBefore = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		balARTHX = arthx_before
		balARTH = arthBefore
		colBalUSDT = collateralBefore
		poolBalUSDT = poolCollateralBefore
		console.log("accounts[0] ARTHX balance:", balARTH.toNumber())
		console.log("accounts[0] ARTH balance:", balARTH.toNumber())
		console.log("accounts[0] 6DEC balance", colBalUSDT.toNumber())
		console.log("ARTH_pool_6DEC balance:", poolBalUSDT.toNumber())

		console.log("pool_6DEC getCollateralPrice() (divided by 1e6):", (new BigNumber(await usdtPoolInstance.getCollateralPrice.call()).div(BIG6)).toNumber())


		// Need to approve first so the pool contract can use transfer
		const DEC6_amount = new BigNumber("10000e6")
		await usdtInstance.approve(usdtPoolInstance.address, DEC6_amount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Redeem some ARTH
		await usdtPoolInstance.recollateralizeARTH(DEC6_amount, new BigNumber("10e6"), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		console.log("accounts[0] recollateralizeARTH() with 10,000 6DEC")

		// Note the ARTHX, ARTH, and FAKE amounts after redeeming
		const arthx_after = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthAfter = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralAfter = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralAfter = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		console.log("accounts[0] ARTHX balance change:", arthx_after.toNumber() - arthx_before.toNumber())
		console.log("accounts[0] ARTH balance change:", arthAfter.toNumber() - arthBefore.toNumber())
		console.log("accounts[0] 6DEC balance change:", collateralAfter.toNumber() - collateralBefore.toNumber())
		console.log("ARTH_pool_6DEC balance change:", poolCollateralAfter.toNumber() - poolCollateralBefore.toNumber())

		// Note the new collateral ratio
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.geGlobalCollateralValue.call()).div(BIG18).toNumber()
		console.log("effective collateral ratio after:", globalCollateralValue / totalSupplyARTH)
	})

	it('Mint some ARTH using ARTHX (collateral ratio = 0) [mintAlgorithmicARTH]', async () => {
		for (let i = 0; i < 4 * 96; i++) { //drop by 96%
			await time.increase(3600 + 1)
			await time.advanceBlock()
			await arthControllerInstance.refreshCollateralRatio()
			if (i % 20 == 0) {
				console.log("globalCollateralRatio:", (new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)).toNumber())
			}
		}

		// drop it 3 more times
		await time.increase(3600 + 1)
		await time.advanceBlock()
		await arthControllerInstance.refreshCollateralRatio()
		await time.increase(3600 + 1)
		await time.advanceBlock()
		await arthControllerInstance.refreshCollateralRatio()
		await time.increase(3600 + 1)
		await time.advanceBlock()
		await arthControllerInstance.refreshCollateralRatio()

		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()
		console.log("ARTH price (USD): ", (new BigNumber(await arthControllerInstance.getARTHPrice.call()).div(BIG6)).toNumber())
		console.log("ARTHX price (USD): ", (new BigNumber(await arthControllerInstance.getARTHXPrice.call()).div(BIG6)).toNumber())
		console.log("totalSupplyARTH: ", totalSupplyARTH)
		console.log("totalSupplyARTHX: ", totalSupplyARTHX)
		console.log("globalCollateralRatio: ", globalCollateralRatio)
		console.log("globalCollateralValue: ", globalCollateralValue)
		console.log("")

		// IF YOU ARE RUNNING TESTS, YOU NEED TO COMMENT OUT THE RELEVANT PART IN THE DEPLOY SCRIPT!
		// IF YOU ARE RUNNING TESTS, YOU NEED TO COMMENT OUT THE RELEVANT PART IN THE DEPLOY SCRIPT!
		// IF YOU ARE RUNNING TESTS, YOU NEED TO COMMENT OUT THE RELEVANT PART IN THE DEPLOY SCRIPT!
		//console.log(chalk.red("IF YOU ARE RUNNING TESTS, YOU NEED TO COMMENT OUT THE RELEVANT PART IN THE DEPLOY SCRIPT!"))

		// Note the collateral ratio
		const collateral_ratio_before = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("collateral_ratio_before: ", collateral_ratio_before.toNumber())

		// Note the ARTHX and ARTH amounts before minting
		const arthx_before = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthBefore = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		balARTHX = arthx_before
		balARTH = arthBefore
		console.log("accounts[0] ARTHX balance before:", arthx_before.toNumber())
		console.log("accounts[0] ARTH balance before:", arthBefore.toNumber())

		// Need to approve first so the pool contract can use transferFrom
		const arthxAmount = new BigNumber("10000e18")
		await arthxInstance.approve(usdtPoolInstance.address, arthxAmount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Mint some ARTH
		await usdtPoolInstance.mintAlgorithmicARTH(arthxAmount, new BigNumber("10e18"), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		console.log("accounts[0] mintAlgorithmicARTH() using 10,000 ARTHX")

		// Note the ARTHX and ARTH amounts after minting
		const arthx_after = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthAfter = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		console.log("accounts[0] ARTHX balance after:", arthx_after.toNumber() - arthx_before.toNumber())
		console.log("accounts[0] ARTH balance after:", arthAfter.toNumber() - arthBefore.toNumber())

		// Note the new collateral ratio
		const crAfter = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("crAfter: ", crAfter.toNumber())
	})

	// MINTING AND REDEMPTION [Other CRs]
	// ================================================================

	it('Redeem some ARTH for ARTHX (collateral ratio = 0) [redeemAlgorithmicARTH]', async () => {
		console.log("=========================redeemAlgorithmicARTH=========================")
		// Advance 1 hr so the collateral ratio can be recalculated
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()
		console.log("ARTH price (USD): ", (new BigNumber(await arthControllerInstance.getARTHPRice.call()).div(BIG6)).toNumber())
		console.log("ARTHX price (USD): ", (new BigNumber(await arthControllerInstance.getARTHXPrice.call()).div(BIG6)).toNumber())
		console.log("totalSupplyARTH: ", totalSupplyARTH)
		console.log("totalSupplyARTHX: ", totalSupplyARTHX)
		console.log("globalCollateralRatio: ", globalCollateralRatio)
		console.log("globalCollateralValue: ", globalCollateralValue)
		console.log("")

		// Note the collateral ratio
		const collateral_ratio_before = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("collateral_ratio_before: ", collateral_ratio_before.toNumber())

		// Note the ARTHX, ARTH, and FAKE amounts before minting
		const arthx_before = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthBefore = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		console.log("accounts[0] ARTHX balance before:", arthx_before.toNumber())
		console.log("accounts[0] ARTH balance before:", arthBefore.toNumber())

		// Need to approve first so the pool contract can use transfer
		const arth_amount = new BigNumber("1000e18")
		await arthInstance.approve(usdtPoolInstance.address, arth_amount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Redeem some ARTH
		await usdtPoolInstance.redeemAlgorithmicARTH(arth_amount, new BigNumber("10e18"), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })
		console.log("accounts[0] redeemAlgorithmicARTH() using 1,000 ARTH")

		// Collect redemption
		await time.advanceBlock()
		await time.advanceBlock()
		await time.advanceBlock()
		await usdtPoolInstance.collectRedemption({ from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Note the ARTHX, ARTH, and FAKE amounts after minting
		const arthx_after = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const arthAfter = new BigNumber(await arthInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)

		console.log("accounts[0] ARTHX change:", arthx_after.toNumber() - arthx_before.toNumber())
		console.log("accounts[0] ARTH change:", arthAfter.toNumber() - arthBefore.toNumber())
	})


	it("Buys back collateral using ARTHX [should fail if CR = 0]", async () => {
		console.log("=========================buyBackARTHX=========================")
	
		totalSupplyARTH = new BigNumber(await arthInstance.totalSupply.call()).div(BIG18).toNumber()
		totalSupplyARTHX = new BigNumber(await arthxInstance.totalSupply.call()).div(BIG18).toNumber()
		globalCollateralRatio = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6).toNumber()
		globalCollateralValue = new BigNumber(await arthControllerInstance.getGlobalCollateralValue.call()).div(BIG18).toNumber()
		console.log("ARTH price (USD): ", (new BigNumber(await arthControllerInstance.getARTHPrice.call()).div(BIG6)).toNumber())
		console.log("ARTHX price (USD): ", (new BigNumber(await arthControllerInstance.getARTHXPrice.call()).div(BIG6)).toNumber())
		console.log("totalSupplyARTH: ", totalSupplyARTH)
		console.log("totalSupplyARTHX: ", totalSupplyARTHX)
		console.log("globalCollateralRatio: ", globalCollateralRatio)
		console.log("globalCollateralValue: ", globalCollateralValue)
		console.log("")

		// This will push the collateral ratio below 1
		// Note the collateral ratio
		const collateral_ratio_before = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("collateral_ratio_before: ", collateral_ratio_before.toNumber())

		// Note the ARTHX and FAKE amounts before buying back
		const arthx_before = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralBefore = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralBefore = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		const global_poolCollateralBefore = new BigNumber(await arthInstance.globalCollateralValue.call()).div(BIG18)
		balARTHX = arthx_before
		colBalUSDT = collateralBefore
		poolBalUSDT = poolCollateralBefore
		globalCr = global_poolCollateralBefore
		console.log("accounts[0] ARTHX balance: ", balARTHX.toNumber())
		console.log("accounts[0] 6DEC balance: ", colBalUSDT.toNumber())
		console.log("ARTH_pool_6DEC balance: ", poolBalUSDT.toNumber())
		console.log("globalCr: ", globalCr.toNumber())

		// Available to buyback
		const buyback_available = new BigNumber(await usdtPoolInstance.getAvailableExcessCollateralDV.call()).div(BIG18)
		console.log("buyback_available: $", buyback_available.toNumber())

		// Need to approve first so the pool contract can use transfer
		const arthxAmount = new BigNumber("40000e18")
		await arthxInstance.approve(usdtPoolInstance.address, arthxAmount, { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// ARTHX price
		const arthxPrice = new BigNumber(await arthControllerInstance.getARTHXPrice()).div(BIG6)
		console.log("arthxPrice: $", arthxPrice.toNumber())

		// Buy back some ARTH
		console.log("accounts[0] buyBackARTHX() using 40,000 ARTHX")
		await usdtPoolInstance.buyBackARTHX(arthxAmount, new BigNumber("10e6"), { from: COLLATERAL_ARTH_AND_ARTHX_OWNER })

		// Note the ARTHX and FAKE amounts after buying back
		const arthx_after = new BigNumber(await arthxInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG18)
		const collateralAfter = new BigNumber(await usdtInstance.balanceOf.call(COLLATERAL_ARTH_AND_ARTHX_OWNER)).div(BIG6)
		const poolCollateralAfter = new BigNumber(await usdtInstance.balanceOf.call(usdtPoolInstance.address)).div(BIG6)
		const global_poolCollateralAfter = new BigNumber(await arthInstance.globalCollateralValue.call()).div(BIG18)
		console.log("accounts[0] ARTHX balance change: ", arthx_after.toNumber() - arthx_before.toNumber())
		console.log("accounts[0] 6DEC balance change: ", collateralAfter.toNumber() - collateralBefore.toNumber())
		console.log("ARTH_pool_6DEC balance change: ", poolCollateralAfter.toNumber() - poolCollateralBefore.toNumber())
		console.log("globalCr change: ", global_poolCollateralAfter.toNumber() - global_poolCollateralBefore.toNumber())

		// Note the new collateral ratio
		const crAfter = new BigNumber(await arthControllerInstance.getGlobalCollateralRatio.call()).div(BIG6)
		console.log("crAfter: ", crAfter.toNumber())
		console.log("getCollateralPrice() from ARTH_pool_6DEC: ", (new BigNumber(await usdtPoolInstance.getCollateralPrice.call()).div(BIG6)).toNumber())
	})
})