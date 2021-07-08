// eslint-disable-next-line no-unused-vars
const { accounts, defaultSender } = require('@openzeppelin/test-environment');
const { ether, time, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { default: BigNumber } = require('bignumber.js');
const { assert } = require('chai');
const { contract } = require('./twrapper');

const UniswapV2Factory = contract.fromArtifact('UniswapV2Factory');
const UniswapV2Pair = contract.fromArtifact('UniswapV2Pair');
const MockUSDX = contract.fromArtifact('MockUSDX');
const MockUSDY = contract.fromArtifact('MockUSDY');
const MockUSDZ = contract.fromArtifact('MockUSDZ');
const MockWETH = contract.fromArtifact('MockWETH');
const MockWBTC = contract.fromArtifact('MockWBTC');
const EmiPrice = contract.fromArtifact('EmiPrice');

const { web3 } = MockUSDX;

MockUSDX.numberFormat = 'String';

// eslint-disable-next-line import/order
const { BN } = web3.utils;

let uniswapFactory;
let uniswapPair;
let uPair;
let usdx;
let usdy;
let usdz;
let weth;
let wbtc;
let vamp;

const money = {
    ether,
    eth: ether,
    zero: ether('0'),
    weth: ether,
    dai: ether,
    usdx: ether,
    usdy: (value) => ether(value).div(new BN (1e10)),
    usdc: (value) => ether(value).div(new BN (1e12)),
    wbtc: (value) => ether(value).div(new BN (1e10)),
};

/**
 *Token  Decimals
V ETH    (18)
  USDT   (6)
  USDB   (18)
V USDC   (6)
V DAI    (18)
V EMRX   (8)
V WETH   (18)
v WBTC   (8)
  renBTC (8)
*/

describe('EmiPrice test', function () {
    const [TestOwner, alice, bob, clarc, dave, eve, george, henry, ivan] = accounts;

    beforeEach(async function () {
        uniswapFactory = await UniswapV2Factory.new(TestOwner);

        usdx = await MockUSDX.new();
        usdy = await MockUSDY.new();
        usdz = await MockUSDZ.new();
        weth = await MockWETH.new();
        wbtc = await MockWBTC.new();
        price = await EmiPrice.new();

        console.log('123');
        await price.initialize(uniswapFactory.address, uniswapFactory.address, uniswapFactory.address, weth.address);

        /* USDX - USDZ pair (DAI - USDC) */
        await uniswapFactory.createPair(weth.address, usdz.address);

        const pairAddress = await uniswapFactory.getPair(weth.address, usdz.address);
        uniswapPair = await UniswapV2Pair.at(pairAddress);

        /* USDX - WETH pair (DAI - ETH) */
        await uniswapFactory.createPair(usdx.address, weth.address);

        const pairAddressUSDX_WETH = await uniswapFactory.getPair(usdx.address, weth.address);
        uniswapPairUSDX_WETH = await UniswapV2Pair.at(pairAddressUSDX_WETH);

        const wethToPair = new BN(100).mul(new BN(10).pow(new BN(await usdx.decimals()))).toString();
        const usdzToPair = new BN(101).mul(new BN(10).pow(new BN(await usdz.decimals()))).toString();
    
        const usdxToPair_USDXWETH = new BN(400).mul(new BN(10).pow(new BN(await usdx.decimals()))).toString();
        const wethToPair_USDXWETH = new BN(1).mul(new BN(10).pow(new BN(await weth.decimals()))).toString();

        await weth.deposit({ value: wethToPair });
        await weth.transfer(uniswapPair.address, wethToPair);
        await usdz.transfer(uniswapPair.address, usdzToPair);
        await uniswapPair.mint(alice);
        let ttt = new BN(wethToPair);
        let ttt2 = new BN(usdzToPair);
        await weth.deposit({ value: ttt.mul(new BN(10)).toString()});
        await weth.transfer(uniswapPair.address, ttt.mul(new BN(10)).toString());
        await usdz.transfer(uniswapPair.address, ttt2.mul(new BN(10)).toString());
        await uniswapPair.mint(bob);

        await weth.deposit({ value: ttt.mul(new BN(30)).toString() });
        await weth.transfer(uniswapPair.address, ttt.mul(new BN(30)).toString());
        await usdz.transfer(uniswapPair.address, ttt2.mul(new BN(30)).toString());
        await uniswapPair.mint(dave);

        await usdx.transfer(bob, usdxToPair_USDXWETH);
        await usdx.transfer(uniswapPairUSDX_WETH.address, usdxToPair_USDXWETH);
        await weth.deposit({ value: wethToPair_USDXWETH });
        await weth.transfer(uniswapPairUSDX_WETH.address, wethToPair_USDXWETH);
        await uniswapPairUSDX_WETH.mint(alice);
    });
    describe('get prices of coins', ()=> {
      it('should get prices successfully', async function () {
        let b = await price.getCoinPrices([usdx.address, usdz.address], 1);
        console.log('Got price results: %s, %s', b[0].toString(), b[1].toString());        

        let p0 = parseFloat(b[0].toString(10)) / 100000;
        let p1 = parseFloat(b[1].toString(10)) / 100000;

        console.log('Price calc: %f, %f', p0, p1);

        assert.equal(b.length, 2);
        assert.isAbove(p0, 0);
        assert.isAtLeast(p1, 0);
      });
    });
});
