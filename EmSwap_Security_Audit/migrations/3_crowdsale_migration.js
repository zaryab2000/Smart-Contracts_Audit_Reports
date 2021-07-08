const UniswapV2Factory = artifacts.require('./UniswapV2Factory.sol');
const UniswapV2Pair = artifacts.require('./UniswapV2Pair.sol');
const MockUSDX = artifacts.require('./MockUSDX.sol');
const MockUSDY = artifacts.require('./MockUSDY.sol');
const MockUSDZ = artifacts.require('./MockUSDZ.sol');
const MockWETH = artifacts.require('./MockWETH.sol');
const MockWBTC = artifacts.require('./MockWBTC.sol');
const ESW = artifacts.require('./ESW.sol');
const EmiVesting = artifacts.require('./EmiVesting.sol');
const EmiVoting = artifacts.require('./EmiVoting.sol');
const CrowdSale = artifacts.require('./CrowdSale.sol');
const Referral = artifacts.require('./EmiReferral.sol');

const { BN } = web3.utils;

function timeout (ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports = async function (deployer, network, accounts) {
    console.log('==================================== deploy crowdsale migrations start ===');
    if (network === 'test' || network === 'soliditycoverage') {
        return;
    }

    deployer.deploy(Referral);
    deployer.deploy(MockUSDX);
    deployer.deploy(MockUSDY);
    deployer.deploy(MockUSDZ);
    deployer.deploy(MockWETH);
    deployer.deploy(MockWBTC);
  
    await deployer.deploy(ESW);
    const ESW_deployed = await ESW.deployed();
    await ESW_deployed.initialize();
  
    const EmiVesting_deployed = await deployer.deploy(EmiVesting);
    await EmiVesting_deployed.initialize(ESW_deployed.address, 1);    
  
    await deployer.deploy(UniswapV2Factory, accounts[0]);
  
    const Referral_deployed = await Referral.deployed();
    const MockUSDX_deployed = await MockUSDX.deployed();
    const MockUSDY_deployed = await MockUSDY.deployed();
    const MockUSDZ_deployed = await MockUSDZ.deployed();
    const MockWETH_deployed = await MockWETH.deployed();
    const MockWBTC_deployed = await MockWBTC.deployed();
    const UniswapV2Factory_deployed = await UniswapV2Factory.deployed();
    
    const crowdSale_deployed = await deployer.deploy(CrowdSale);
    crowdSale_deployed.initialize(        
        ESW_deployed.address,
        UniswapV2Factory_deployed.address,
        Referral_deployed.address,
        MockWETH_deployed.address,
        "0x27449b42B4C670eb0b6e7DD55aDebcAfd1F5c199", // foundation
        "0x2f57BcDc0c451cdc6E87c168C5f8223fca066262"); // team

    console.log('\naccounts[0]', accounts[0], '\nESW', ESW_deployed.address,
        '\nReferral', Referral_deployed.address, '\nCrowdSale', crowdSale_deployed.address,
        '\nEmiVesting', EmiVesting_deployed.address,
        '\nMockUSDX', MockUSDX_deployed.address, '\nMockEMRX', MockUSDY_deployed.address,
        '\nMockUSDC', MockUSDZ_deployed.address, '\nMockWETH', MockWETH_deployed.address,
        '\nMockWBTC', MockWBTC_deployed.address, '\nUniswapV2Factory', UniswapV2Factory_deployed.address, '\n');
  
    /* USDX - USDZ pair */
    await UniswapV2Factory_deployed.createPair(MockUSDX_deployed.address, MockUSDZ_deployed.address);
    const pairAddressXZ = await UniswapV2Factory_deployed.getPair(MockUSDX_deployed.address, MockUSDZ_deployed.address);
    const uniswapPairXZ = await UniswapV2Pair.at(pairAddressXZ);
    const usdxToPAir = new BN(10).mul(new BN(10).pow(new BN(await MockUSDX_deployed.decimals())));
    const usdzToPAir = new BN(1).mul(new BN(10).pow(new BN(await MockUSDZ_deployed.decimals())));
    await MockUSDX_deployed.transfer(uniswapPairXZ.address, usdxToPAir);
    await MockUSDZ_deployed.transfer(uniswapPairXZ.address, usdzToPAir);
    await uniswapPairXZ.mint(accounts[0]);

    /* USDX - WETH pair */
    await UniswapV2Factory_deployed.createPair(MockUSDX_deployed.address, MockWETH_deployed.address);
    const pairAddressXWETH = await UniswapV2Factory_deployed.getPair(MockUSDX_deployed.address, MockWETH_deployed.address);
    const uniswapPairXWETH = await UniswapV2Pair.at(pairAddressXWETH);
    const usdxToPAir_USDXWETH = new BN(400).mul(new BN(10).pow(new BN(await MockUSDX_deployed.decimals())));
    const wethToPAir_USDXWETH = new BN(1).mul(new BN(10).pow(new BN(await MockWETH_deployed.decimals())));
    await MockUSDX_deployed.transfer(uniswapPairXWETH.address, usdxToPAir_USDXWETH);
    await MockWETH_deployed.deposit({ value: wethToPAir_USDXWETH }); // need to send ETH to wrap contract
    await MockWETH_deployed.transfer(uniswapPairXWETH.address, wethToPAir_USDXWETH);
    await uniswapPairXWETH.mint(accounts[0]);

    /* USDX - WBTC pair */
    await UniswapV2Factory_deployed.createPair(MockUSDX_deployed.address, MockWBTC_deployed.address);
    const pairAddressXWBTC = await UniswapV2Factory_deployed.getPair(MockUSDX_deployed.address, MockWBTC_deployed.address);
    const uniswapPairXWBTC = await UniswapV2Pair.at(pairAddressXWBTC);
    const usdxToPAir_USDXWBTC = new BN(101000).mul(new BN(10).pow(new BN(await MockUSDX_deployed.decimals())));
    const wbtcToPAir_USDXWBTC = new BN(10).mul(new BN(10).pow(new BN(await MockWBTC_deployed.decimals())));
    await MockUSDX_deployed.transfer(uniswapPairXWBTC.address, usdxToPAir_USDXWBTC);
    await MockWBTC_deployed.transfer(uniswapPairXWBTC.address, wbtcToPAir_USDXWBTC);
    await uniswapPairXWBTC.mint(accounts[0]);

    await ESW_deployed.setVesting(EmiVesting_deployed.address);
    await ESW_deployed.setMintLimit(crowdSale_deployed.address, new BN('100000000').mul(new BN(10).pow(new BN(18))).toString());
    
    // Make crowdsale know about token
    await crowdSale_deployed.fetchCoin(MockUSDX_deployed.address, 1100, 1); // DAI always first, 1 ESW = 0.11 DAI, 1 DAI=1/0.11=9.090909091 ESW
    await crowdSale_deployed.fetchCoin(MockUSDY_deployed.address, 2750, 1); // EMRX = 0.4 DAI, 1 DAI = 1/0.4 EMRX = 2.5 EMRX, 1 ESW = 0.11*2.5 EMRX = 0.275EMRX, 1 EMRX=1/0.275=3.636363636 ESW
    await crowdSale_deployed.fetchCoin(MockUSDZ_deployed.address, 0, 3); // USDC, rate from uniswap
    await crowdSale_deployed.fetchCoin(MockWBTC_deployed.address, 0, 3); // WBTC, rate from uniswap

    // Send test tokens to test Front wallet2 0x6Fa129006DB3469E46FC6d9D39560f99a37C55F7
    await MockUSDY_deployed.transfer('0x6Fa129006DB3469E46FC6d9D39560f99a37C55F7', usdzToPAir);
    await MockUSDZ_deployed.transfer('0x6Fa129006DB3469E46FC6d9D39560f99a37C55F7', usdzToPAir);
    await MockWETH_deployed.deposit({ value: wethToPAir_USDXWETH }); // need to send ETH to wrap contract
    await MockWETH_deployed.transfer('0x6Fa129006DB3469E46FC6d9D39560f99a37C55F7', wethToPAir_USDXWETH);
    await MockUSDX_deployed.transfer('0x6Fa129006DB3469E46FC6d9D39560f99a37C55F7', usdxToPAir_USDXWBTC);
    await MockWBTC_deployed.transfer('0x6Fa129006DB3469E46FC6d9D39560f99a37C55F7', wbtcToPAir_USDXWBTC);
};