const Migrations = artifacts.require('./Migrations.sol');
const UniswapV2Factory = artifacts.require('./UniswapV2Factory.sol');
const UniswapV2Pair = artifacts.require('./UniswapV2Pair.sol');
const EmiFactory = artifacts.require('./EmiFactory.sol');
const EmiSwap  = artifacts.require('./Emiswap.sol');
const EmiRouter= artifacts.require('./EmiRouter.sol');
const EmiVault = artifacts.require('./EmiVault');

const MockWETH = artifacts.require('./MockWETH.sol');
const MockDAI  = artifacts.require('./MockUSDX.sol');
const MockWBTC = artifacts.require('./MockWBTC.sol');
const MockUSDC = artifacts.require('./MockUSDZ.sol');
const MockEMRX = artifacts.require('./MockUSDY.sol');

const EmiVamp  = artifacts.require('EmiVamp');

const EmiPrice = artifacts.require('EmiPrice');

const ESW = artifacts.require('./ESW.sol');
const EmiVesting = artifacts.require('./EmiVesting.sol');
const CrowdSale = artifacts.require('./CrowdSale.sol');
const Referral = artifacts.require('./EmiReferral.sol');

const { BN } = web3.utils;

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(Migrations);
    console.log('==================================== deploy DEX event migrations start ===')
    if (network === 'test' || network === 'soliditycoverage') {
        return;
    }

    await deployer.deploy(ESW);
    const ESW_deployed = await ESW.deployed();
    await ESW_deployed.initialize();

    const EmiVesting_deployed = await deployer.deploy(EmiVesting);
    await EmiVesting_deployed.initialize(ESW_deployed.address);

    await deployer.deploy(UniswapV2Factory, accounts[0]);
    let UniswapV2Factory_deployed = await UniswapV2Factory.deployed();
    let EmiFactory_deployed= await deployer.deploy(EmiFactory);    
    let MockWETH_deployed  = await deployer.deploy(MockWETH);    
    let MockDAI_deployed   = await deployer.deploy(MockDAI);
    let MockWBTC_deployed  = await deployer.deploy(MockWBTC);
    let MockUSDC_deployed  = await deployer.deploy(MockUSDC);
    let MockEMRX_deployed  = await deployer.deploy(MockEMRX);
    let EmiVault_deployed  = await deployer.deploy(EmiVault);
    let Referral_deployed  = await deployer.deploy(Referral);
    let EmiRouter_deployed = await deployer.deploy(EmiRouter, EmiFactory_deployed.address, MockWETH_deployed.address);
    let crowdSale_deployed = await deployer.deploy(CrowdSale);
    let EmiVamp_deployed   = await deployer.deploy(EmiVamp);
    let EmiPrice_deployed  = await deployer.deploy(EmiPrice);

    /* EmiPrice */
    await EmiPrice_deployed.initialize(UniswapV2Factory_deployed.address, UniswapV2Factory_deployed.address, 
        UniswapV2Factory_deployed.address, MockDAI_deployed.address);

    /* EmiFactory init */
    await EmiFactory_deployed.setAdminGrant(accounts[0], true);
    await EmiFactory_deployed.setaddressVault(EmiVault_deployed.address);
    let emiswap_fee = new BN(3).mul(new BN(10).pow(new BN(15))).toString();
    let vault_fee   = new BN(5).mul(new BN(10).pow(new BN(14))).toString();
    await EmiFactory_deployed.setFee(emiswap_fee);    // 0.30%
    await EmiFactory_deployed.setFeeVault(vault_fee); // 0.05%

    /* Crowdsale init */
    await crowdSale_deployed.initialize(        
        ESW_deployed.address,
        UniswapV2Factory_deployed.address,
        Referral_deployed.address,
        MockWETH_deployed.address,
        "0x27449b42B4C670eb0b6e7DD55aDebcAfd1F5c199", // foundation
        "0x2f57BcDc0c451cdc6E87c168C5f8223fca066262"); // team        

    let value400DAI     = new BN(400).mul(new BN(10).pow(new BN(await MockDAI_deployed.decimals())));
    let value1WETH      = new BN(1) .mul(new BN(10).pow(new BN(await MockWETH_deployed.decimals())));
    let value11100DAI   = new BN(11100).mul(new BN(10).pow(new BN(await MockDAI_deployed.decimals())));
    let value110DAI     = new BN(110).mul(new BN(10).pow(new BN(await MockDAI_deployed.decimals())));    
    let value1WBTC      = new BN(1).mul(new BN(10).pow(new BN(await MockWBTC_deployed.decimals())));
    let value11000USDC  = new BN(11000).mul(new BN(10).pow(new BN(await MockUSDC_deployed.decimals())));
    let value100USDC    = new BN(100).mul(new BN(10).pow(new BN(await MockUSDC_deployed.decimals())));
    let valueZERO       = new BN(0);

    //await MockDAI_deployed.mint( accounts[0], value400DAI );
    await MockWETH_deployed.deposit( { value: value1WETH } );
    await MockDAI_deployed.approve( EmiRouter_deployed.address, value400DAI.add(value11100DAI) );
    await MockWETH_deployed.approve( EmiRouter_deployed.address, value1WETH );
    await MockWBTC_deployed.approve( EmiRouter_deployed.address, value1WBTC.add(value1WBTC) );
    await MockUSDC_deployed.approve( EmiRouter_deployed.address, value11000USDC );

    // WETH-DAI Add liquidity (1:400)
    await EmiRouter_deployed.addLiquidity(
        MockWETH_deployed.address, 
        MockDAI_deployed.address,
        value1WETH,
        value400DAI,
        valueZERO,
        valueZERO);

    // DAI-WBTC Add liquidity (11100:1)
    await EmiRouter_deployed.addLiquidity(
        MockDAI_deployed.address, 
        MockWBTC_deployed.address,
        value11100DAI,
        value1WBTC,
        valueZERO,
        valueZERO);

    // USDC-WBTC Add liquidity (11000:1)
    await EmiRouter_deployed.addLiquidity(
        MockUSDC_deployed.address, 
        MockWBTC_deployed.address,
        value11000USDC,
        value1WBTC,
        valueZERO,
        valueZERO);        

    let liquidityWETH_DAI = await EmiRouter_deployed.getLiquidity( MockWETH_deployed.address, MockDAI_deployed.address  );
    let liquidityDAI_WBTC= await EmiRouter_deployed.getLiquidity( MockDAI_deployed.address, MockWBTC_deployed.address );
    let liquidityUSDC_WBTC= await EmiRouter_deployed.getLiquidity( MockUSDC_deployed.address, MockWBTC_deployed.address );

    /* DAI - WETH pair */
    await UniswapV2Factory_deployed.createPair(MockDAI_deployed.address, MockWETH_deployed.address);
    const pairAddressDAIWETH = await UniswapV2Factory_deployed.getPair(MockDAI_deployed.address, MockWETH_deployed.address);
    const uniswapPairDAIWETH = await UniswapV2Pair.at(pairAddressDAIWETH);
    const usdxToPAir_USDXWETH = new BN(400).mul(new BN(10).pow(new BN(await MockDAI_deployed.decimals())));
    const wethToPAir_USDXWETH = new BN(1).mul(new BN(10).pow(new BN(await MockWETH_deployed.decimals())));
    await MockDAI_deployed.transfer(uniswapPairDAIWETH.address, usdxToPAir_USDXWETH);
    await MockWETH_deployed.deposit({ value: wethToPAir_USDXWETH }); // need to send ETH to wrap contract
    await MockWETH_deployed.transfer(uniswapPairDAIWETH.address, wethToPAir_USDXWETH);
    await uniswapPairDAIWETH.mint(accounts[0]);

    /* DAI - WBTC pair */
    await UniswapV2Factory_deployed.createPair(MockDAI_deployed.address, MockWBTC_deployed.address);
    const pairAddressDAIWBTC = await UniswapV2Factory_deployed.getPair(MockDAI_deployed.address, MockWBTC_deployed.address);
    const uniswapPairDAIWBTC = await UniswapV2Pair.at(pairAddressDAIWBTC);
    const usdxToPAir_USDXWBTC = new BN(101000).mul(new BN(10).pow(new BN(await MockDAI_deployed.decimals())));
    const wbtcToPAir_USDXWBTC = new BN(10).mul(new BN(10).pow(new BN(await MockWBTC_deployed.decimals())));
    await MockDAI_deployed.transfer(uniswapPairDAIWBTC.address, usdxToPAir_USDXWBTC);
    await MockWBTC_deployed.transfer(uniswapPairDAIWBTC.address, wbtcToPAir_USDXWBTC);
    await uniswapPairDAIWBTC.mint(accounts[0]);

    /* DAI - USDC pair */
    await UniswapV2Factory_deployed.createPair(MockDAI_deployed.address, MockUSDC_deployed.address);
    const pairAddressDAIUSDC = await UniswapV2Factory_deployed.getPair(MockDAI_deployed.address, MockUSDC_deployed.address);
    const uniswapPairDAIUSDC = await UniswapV2Pair.at(pairAddressDAIUSDC);
    await MockDAI_deployed.transfer(uniswapPairDAIUSDC.address, value110DAI);
    await MockUSDC_deployed.transfer(uniswapPairDAIUSDC.address, value100USDC);
    await uniswapPairDAIUSDC.mint(accounts[0]);

    // removed
    //await ESW_deployed.setVesting(EmiVesting_deployed.address); 
    await ESW_deployed.setMintLimit(crowdSale_deployed.address, new BN('40000000').mul(new BN(10).pow(new BN(18))).toString());
    
    // Make crowdsale know about token
    await crowdSale_deployed.fetchCoin(MockDAI_deployed.address,  1100, 1); // DAI always first, 1 ESW = 0.11 DAI, 1 DAI=1/0.11=9.090909091 ESW
    await crowdSale_deployed.fetchCoin(MockEMRX_deployed.address, 2750, 1); // EMRX = 0.4 DAI, 1 DAI = 1/0.4 EMRX = 2.5 EMRX, 1 ESW = 0.11*2.5 EMRX = 0.275EMRX, 1 EMRX=1/0.275=3.636363636 ESW
    await crowdSale_deployed.fetchCoin(MockUSDC_deployed.address,    0, 3); // USDC, rate from uniswap
    await crowdSale_deployed.fetchCoin(MockWBTC_deployed.address,    0, 3); // WBTC, rate from uniswap

    /* EmiVamp can eat liquidity from uiniswap pairs */
    await EmiVamp_deployed.initialize([pairAddressDAIUSDC, pairAddressDAIWBTC, pairAddressDAIWETH], [0, 0, 0], EmiRouter_deployed.address);
    
    console.log("========= EMISWAP ======================================================",        
        "\n emiswap_fee =", emiswap_fee,
        "\n vault_fee   =", vault_fee,
        "\n EmiFactory  =", EmiFactory_deployed.address,
        "\n EmiRouter   =", EmiRouter_deployed.address,
        "\n EmiVault    =", EmiVault_deployed.address,
        "\n WETH        =", MockWETH_deployed.address,        
        "\n MockWBTC    =", MockWBTC_deployed.address,
        "\n MockUSDC    =", MockUSDC_deployed.address,
        "\n MockEMRX    =", MockEMRX_deployed.address,
        "\n DAI         =", MockDAI_deployed.address,
        "\n\n Added liquidity WETH-DAI (LP tokens) =", liquidityWETH_DAI.div(new BN(10).pow(new BN(18))).toString(),
        "\n Added liquidity DAI-WBTC (LP tokens) =", liquidityDAI_WBTC.div(new BN(10).pow(new BN(18))).toString(),
        "\n Added liquidity USDC-WBTC (LP tokens) =", liquidityUSDC_WBTC.div(new BN(10).pow(new BN(6))).toString(),
        "\n WETH-DAI address", (await EmiSwap.at(await EmiFactory_deployed.pools(MockWETH_deployed.address, MockDAI_deployed.address))).address,
        "\n DAI-WBTC address", (await EmiSwap.at(await EmiFactory_deployed.pools(MockWBTC_deployed.address, MockDAI_deployed.address))).address,
        "\n USDC-WBTC address", (await EmiSwap.at(await EmiFactory_deployed.pools(MockWBTC_deployed.address, MockUSDC_deployed.address))).address,

        "\n\n---------- UNISWAP ----------------------------------------------------",
        "\nUniswapV2Factory", UniswapV2Factory_deployed.address,
        "\n\n DAI-WETH pair => 400:1",
        "\n WBTC-DAI pair => 10100:1",
        "\n DAI-USDC(Z) pair => 110:100",
        "\n\n---------- CROWDSALE --------------------------------------------------",
        '\n ESW', ESW_deployed.address,
        '\n Referral', Referral_deployed.address, 
        '\n CrowdSale', crowdSale_deployed.address,
        '\n EmiVesting', EmiVesting_deployed.address,
        "\n\n---------- EmiVamp ----------------------------------------------------",
        "\n EmiVamp                = ", EmiVamp_deployed.address,
        "\n can eat:",
        "\n uniswap Pair DAI-USDC  = ", pairAddressDAIUSDC, 
        "\n uniswap Pair DAI-WBTC  = ", pairAddressDAIWBTC, 
        "\n uniswap Pair DAI-WETH  = ", pairAddressDAIWETH,
        "\n\n---------- EmiPrice ---------------------------------------------------",
        "\n EmiPrice               = ", EmiPrice_deployed.address
    );

    // Approve for remove liauiduty
    let WETHDAI_pair = await EmiSwap.at(await EmiFactory_deployed.pools(MockWETH_deployed.address, MockDAI_deployed.address));
    console.log(
        '\n WETH-DAI pair address', WETHDAI_pair.address,
        '\nLP balance before remove liquidity', (await WETHDAI_pair.balanceOf(accounts[0])).toString(),
        '\nWETH balance', (await MockWETH_deployed.balanceOf(accounts[0])).toString(),
        '\nDAI balance', (await MockDAI_deployed.balanceOf(accounts[0])).toString() );

    await WETHDAI_pair.approve(EmiRouter_deployed.address, '100000000000000000000');
    
    await EmiRouter_deployed.removeLiquidity(MockWETH_deployed.address, MockDAI_deployed.address, '100000000000000000000', '0', '0');
    console.log('LP balance after remove liquidity', (await WETHDAI_pair.balanceOf(accounts[0])).toString(),
        '\nWETH balance', (await MockWETH_deployed.balanceOf(accounts[0])).toString(),
        '\nDAI balance', (await MockDAI_deployed.balanceOf(accounts[0])).toString()  );

    // making swap 0.1 ETH for DAI
    let _WETH_0_1 = '100000000000000000';
    await MockWETH_deployed.approve( EmiRouter_deployed.address, _WETH_0_1);
    await EmiRouter_deployed.swapExactTokensForTokens (_WETH_0_1, 0, [MockWETH_deployed.address, MockDAI_deployed.address], accounts[0], '0x6fbb246BfF73a1f71D32a3345baF2239473483f3');
    console.log('swap 0.1 WETH for DAI',
        '\nWETH balance', (await MockWETH_deployed.balanceOf(accounts[0])).toString(),
        '\nDAI balance', (await MockDAI_deployed.balanceOf(accounts[0])).toString()  );

    // separate LP token transfer
    await WETHDAI_pair.transfer('0x6fbb246BfF73a1f71D32a3345baF2239473483f3', '100000000000000000000');
    console.log('100 LP transfered to 0x6fbb246BfF73a1f71D32a3345baF2239473483f3 and it"s balance after\n', 
        (await WETHDAI_pair.balanceOf('0x6fbb246BfF73a1f71D32a3345baF2239473483f3')).toString());

    // 0xD6C45e77fab68193847f19Ce839fa3320D5Aa796
    // 0xe29ec5380C08A2a68D4AB3ad765f51801Ded674B
    // 0x573A865d71E3c78fd5a4b6cB1cFF8421F0C3aa74
    for (const iterator of ['0x2286FdF5A6B7Ab1BEb7fffBAb15db7Ff9358a9fa', '0xe29ec5380C08A2a68D4AB3ad765f51801Ded674B', '0x573A865d71E3c78fd5a4b6cB1cFF8421F0C3aa74', '0xd67C3f117B90C0930CeAf80325c83416dfF57bec']) {
        console.log('transfer tokens for', iterator)
        await MockUSDC_deployed.transfer(iterator, new BN(1000000).mul(new BN(10).pow(new BN(await MockUSDC_deployed.decimals()))));
        await MockEMRX_deployed.transfer(iterator, new BN(1000000).mul(new BN(10).pow(new BN(await MockEMRX_deployed.decimals()))));
        await MockDAI_deployed .transfer(iterator, new BN(1000000).mul(new BN(10).pow(new BN(await MockDAI_deployed .decimals()))));
        await MockWBTC_deployed.transfer(iterator, new BN(1000000).mul(new BN(10).pow(new BN(await MockWBTC_deployed.decimals()))));
    }    
};