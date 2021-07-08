const Migrations = artifacts.require('./Migrations.sol');
const EmiFactory = artifacts.require('./EmiFactory.sol');
const EmiSwap = artifacts.require('./Emiswap.sol');
const EmiRouter = artifacts.require('./EmiRouter.sol');
const EmiVault = artifacts.require('./EmiVault');

const MockWETH = artifacts.require('./MockWETH.sol');
const MockDAI = artifacts.require('./MockUSDX.sol');
const MockWBTC = artifacts.require('./MockWBTC.sol');
const MockUSDC = artifacts.require('./MockUSDZ.sol');

const { BN } = web3.utils;

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(Migrations);
    console.log('==================================== deploy DEX migrations start ===')
    if (network === 'test' || network === 'soliditycoverage') {
        return;
    }

    let EmiFactory_deployed = await deployer.deploy(EmiFactory);
    let MockWETH_deployed     = await deployer.deploy(MockWETH);
    let MockDAI_deployed = await deployer.deploy(MockDAI);
    let MockWBTC_deployed = await deployer.deploy(MockWBTC);
    let MockUSDC_deployed = await deployer.deploy(MockUSDC);
    let EmiVault_deployed = await deployer.deploy(EmiVault);
    let EmiRouter_deployed    = 
        await deployer.deploy(EmiRouter, EmiFactory_deployed.address, MockWETH_deployed.address);

    let value400DAI     = new BN(400).mul(new BN(10).pow(new BN(await MockDAI_deployed.decimals())));
    let value1WETH      = new BN(1) .mul(new BN(10).pow(new BN(await MockWETH_deployed.decimals())));
    let value11100DAI   = new BN(11100).mul(new BN(10).pow(new BN(await MockDAI_deployed.decimals())));
    let value1WBTC      = new BN(1).mul(new BN(10).pow(new BN(await MockWBTC_deployed.decimals())));
    let value11000USDC  = new BN(11000).mul(new BN(10).pow(new BN(await MockUSDC_deployed.decimals())));
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
    
    console.log("==================================================================",
        "\nEmiFactory deployed =", EmiFactory_deployed.address,
        "\nEmiRouter deployed  =", EmiRouter_deployed.address,
        "\nEmiVault_deployed   =", EmiVault_deployed.address,
        "\nWETH deployed       =", MockWETH_deployed.address,        
        "\nMockWBTC_deployed   =", MockWBTC_deployed.address,
        "\nMockUSDC_deployed   =", MockUSDC_deployed.address,
        "\nDAI deployed        =", MockDAI_deployed.address,        
        "\n\nAdded liquidity WETH-DAI (LP tokens) =", liquidityWETH_DAI.div(new BN(10).pow(new BN(18))).toString(),
        "\n\nAdded liquidity DAI-WBTC (LP tokens) =", liquidityDAI_WBTC.div(new BN(10).pow(new BN(18))).toString(),
        "\n\nAdded liquidity USDC-WBTC (LP tokens) =", liquidityUSDC_WBTC.div(new BN(10).pow(new BN(6))).toString()
    );

    // Approve for remove liauiduty
    let WETHDAI_pair = await EmiSwap.at(await EmiFactory_deployed.pools(MockWETH_deployed.address, MockDAI_deployed.address));
    console.log('\nLP balance before remove liquidity', (await WETHDAI_pair.balanceOf(accounts[0])).toString(),
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
    console.log('100 LP transfered to 0x6fbb246BfF73a1f71D32a3345baF2239473483f3 and it"s balance after', 
        (await WETHDAI_pair.balanceOf('0x6fbb246BfF73a1f71D32a3345baF2239473483f3')).toString());
};