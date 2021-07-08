const { constants, time, ether, expectRevert } = require('@openzeppelin/test-helpers');
const expectEvent = require('@openzeppelin/test-helpers/src/expectEvent');
const { expect, assert } = require('chai');

const { contract } = require('./twrapper');

const { BN } = web3.utils;
const money = {
    ether,
    eth: ether,
    zero: ether('0'),
    oneWei: ether('0').addn(1),
    weth: ether,
    dai: ether,
    usdc: (value) => ether(value).div(new BN (1e12))
};

async function trackReceivedToken (token, wallet, txPromise) {
    const preBalance = web3.utils.toBN(
        (token === constants.ZERO_ADDRESS)
            ? await web3.eth.getBalance(wallet)
            : await token.balanceOf(wallet),
    );

    let txResult = await txPromise();
    if (txResult.receipt) {
        // Fix coverage since testrpc-sc gives: { tx: ..., receipt: ...}
        txResult = txResult.receipt;
    }
    let txFees = web3.utils.toBN('0');
    if (wallet.toLowerCase() === txResult.from.toLowerCase() && token === constants.ZERO_ADDRESS) {
        const receipt = await web3.eth.getTransactionReceipt(txResult.transactionHash);
        const tx = await web3.eth.getTransaction(receipt.transactionHash);
        txFees = web3.utils.toBN(receipt.gasUsed).mul(web3.utils.toBN(tx.gasPrice));
    }

    const postBalance = web3.utils.toBN(
        (token === constants.ZERO_ADDRESS)
            ? await web3.eth.getBalance(wallet)
            : await token.balanceOf(wallet),
    );

    return postBalance.sub(preBalance).add(txFees);
}

/* const EmiFactory = contract.fromArtifact('FactoryMock');
const Emiswap = contract.fromArtifact('EmiswapMock'); */
const EmiFactory = contract.fromArtifact('EmiFactory');
const Emiswap = contract.fromArtifact('Emiswap');

const EmiRouter = contract.fromArtifact('EmiRouter');
const Token = contract.fromArtifact('TokenMock');
const TokenWETH = contract.fromArtifact('MockWETH');

describe('EmiRouter', function () {
    const [_owner, wallet1, wallet2, wallet3, vaultWallet] = accounts;
    beforeEach(async function () {
        //await commonTestStarter(accounts, this);
        this.factory = await EmiFactory.new();
        //await this.factory.setFee(money.weth('0.003'));

        await this.factory.setAdminGrant(_owner, true);
        await this.factory.setFee(     money.weth('0.0030'), {from: _owner});
        //await this.factory.setAdminGrant(_owner, false);
        await this.factory.setFeeVault(money.weth('0.0005'), {from: _owner});
        await this.factory.setaddressVault(vaultWallet, {from: _owner});


        this.DAI = await Token.new('DAI', 'DAI', 18);
        this.WETH = await TokenWETH.new();
        this.USDC = await Token.new('USDC', 'USDC', 6);
        this.router = await EmiRouter.new(this.factory.address, this.WETH.address);
        this.emiswap = "";
        this.LPtoken = "";

        await this.DAI.mint(wallet1, money.dai('800'));
        await this.WETH.deposit({ from: wallet1, value: money.weth('2') });

        await this.DAI.approve(this.router.address, money.dai('800'), { from: wallet1 });
        await this.WETH.approve(this.router.address, money.weth('2'), { from: wallet1 });

        await this.DAI.mint(wallet2, money.dai('800'));
        await this.WETH.deposit({ from: wallet2, value: money.weth('2') });

        await this.DAI.approve(this.router.address, money.dai('800'), { from: wallet2 });
        await this.WETH.approve(this.router.address, money.weth('2'), { from: wallet2 });

        // Set 1 mln pool
        await this.DAI.mint(wallet3, money.dai('2000000'));
        await this.USDC.mint(wallet3, money.usdc('1000000'));
        await this.DAI.approve(this.router.address, money.dai('2000000'), { from: wallet3 });
        await this.USDC.approve(this.router.address, money.usdc('1000000'), { from: wallet3 });
        console.log('balance USDC', (await this.USDC.balanceOf(wallet3)).div(money.usdc('1')).toString());
        console.log('balance DAI ', (await this.DAI.balanceOf(wallet3)).div(money.dai('1')).toString());
    });
    describe('Creation, swap and remove liquidity in ERC-20 - ERC-20', async function () {
        beforeEach(async function () {
            let res = await this.router.addLiquidity(
                this.WETH.address, 
                this.DAI.address,
                money.weth('1'),
                money.dai('400'),
                money.zero,
                money.zero,
                wallet3,
                { from: wallet1 });
                        
            this.emiswap = await this.factory.pools(this.WETH.address, this.DAI.address);
            this.LPtoken = await new Token(this.emiswap);
            const liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet1 });
            expect(liquidity).to.be.bignumber.equal(money.dai('400'));
            console.log("First pair creation with liquidity , gasUsed =", res.receipt.gasUsed);
        })
        it('create add liquidity ERC-20 - ERC-20', async function () {
            const DAIfirstdeposite = await this.DAI.balanceOf(this.emiswap);
            const WETHfirstdeposite = await this.WETH.balanceOf(this.emiswap);
            expect(DAIfirstdeposite).to.be.bignumber.equal(money.dai('400'));
            expect(WETHfirstdeposite).to.be.bignumber.equal(money.weth('1'));
        });
        it('add more liquidity ERC-20 - ERC-20', async function () {
            let res = await this.router.addLiquidity(
                this.WETH.address, 
                this.DAI.address,
                money.weth('1'),
                money.dai('400'),
                money.zero,
                money.zero,
                wallet3,
                { from: wallet2 });

            const DAIseconddeposite = await this.DAI.balanceOf(this.emiswap);
            const WETHfirstdeposite = await this.WETH.balanceOf(this.emiswap);
            const liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet2 });
            expect(DAIseconddeposite).to.be.bignumber.equal(money.dai('800'));
            expect(WETHfirstdeposite).to.be.bignumber.equal(money.weth('2'));
            expect(liquidity).to.be.bignumber.equal(money.dai('400').addn(1000));
            console.log("Adding liquidity for wallet2, gasUsed =", res.receipt.gasUsed);
        });
        it('swap Exact Tokens For Tokens ERC-20 - ERC-20', async function () {
            let balance = await this.WETH.balanceOf(wallet2);

            await this.DAI.approve(this.router.address, money.dai('40'), { from: wallet2 });
            let res = await this.router.swapExactTokensForTokens(
                money.dai('40'),
                money.weth('0.09'),
                [this.DAI.address, this.WETH.address],
                wallet2,
                constants.ZERO_ADDRESS,
                { from: wallet2 }
            )
            balance = (await this.WETH.balanceOf(wallet2)).sub(balance);
            expect(balance).to.be.bignumber.above(money.weth('0.09')); // > 0.09
            console.log("swap Exact Tokens For Tokens for wallet2, gasUsed =", res.receipt.gasUsed);
        });
        it('swap Tokens For Exact Tokens ERC-20 - ERC-20', async function () {
            let balance = await this.WETH.balanceOf(wallet2);

            await this.DAI.approve(this.router.address, money.dai('50'), { from: wallet2 });
            let res = await this.router.swapTokensForExactTokens(
                money.weth('0.1'), // exact output
                money.dai('50'),   // maximum input
                [this.DAI.address, this.WETH.address],
                wallet2,
                constants.ZERO_ADDRESS,
                { from: wallet2 }
            )
            balance = (await this.WETH.balanceOf(wallet2)).sub(balance);
            expect(balance).to.be.bignumber.least(money.weth('0.099999999999999955')); // >= 0.1
            console.log("swap Tokens For Exact Tokens for wallet2, gasUsed =", res.receipt.gasUsed);
        });        
        it('remove liquidity ERC-20 - ERC-20', async function () {
            let liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet1 });
            await this.LPtoken.approve(this.router.address, liquidity, { from: wallet1 });

            let res = await this.router.removeLiquidity(
                this.WETH.address, 
                this.DAI.address,
                liquidity,
                money.zero,
                money.zero,
                { from: wallet1 });
            
            console.log("Remove liquidity, gasUsed =", res.receipt.gasUsed);
            liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet1 });
            DAIseconddeposite = await this.DAI.balanceOf(wallet1);
            WETHfirstdeposite = await this.WETH.balanceOf(wallet1);

            expect(liquidity).to.be.bignumber.equal(money.zero);
            expect(DAIseconddeposite).to.be.bignumber.above(money.dai('400'));
            expect(WETHfirstdeposite).to.be.bignumber.above(money.weth('1'));
        });
    });
    describe('Creation, swap and remove liquidity in raw-ETH - ERC-20', async function () {
        beforeEach(async function () {
            let res = await this.router.addLiquidityETH(
                this.DAI.address,            
                money.dai('400'),
                money.dai('100'),
                money.weth('1'),//money.weth('0.9'),
                wallet3,
                { value: money.eth('1'), from: wallet1 });
                    
            this.emiswap = await this.factory.pools(this.WETH.address, this.DAI.address);
            this.LPtoken = await new Token(this.emiswap);
            const liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet1 });
            expect(liquidity).to.be.bignumber.equal(money.dai('400'));
            console.log("First pair creation liquidity with raw-ETH, gasUsed =", res.receipt.gasUsed);
        });
        it('add more liquidity raw-ETH - ERC-20', async function () {
            let res = await this.router.addLiquidityETH(
                this.DAI.address,            
                money.dai('400'),
                money.dai('100'),
                money.weth('0.9'),
                wallet3,
                { value: money.eth('1'), from: wallet2 });

            this.emiswap = await this.factory.pools(this.WETH.address, this.DAI.address);
            this.LPtoken = await new Token(this.emiswap);
            const liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet2 });
            expect(liquidity).to.be.bignumber.above(money.dai('400'));
            console.log("add more liquidity with raw-ETH, gasUsed =", res.receipt.gasUsed);
        });
        it('swap Exact ETH For Tokens raw-ETH -> ERC-20', async function () {
            let balance = await this.DAI.balanceOf(wallet2);
            
            let res = await this.router.swapExactETHForTokens(                
                money.dai('30'),
                [this.WETH.address, this.DAI.address],
                wallet2,
                constants.ZERO_ADDRESS,
                { value: money.weth('0.1'), from: wallet2 }
            )
            balance = (await this.DAI.balanceOf(wallet2)).sub(balance);
            expect(balance).to.be.bignumber.above(money.dai('30')); // > 30
            console.log("swap Exact Tokens For Tokens for wallet2, gasUsed =", res.receipt.gasUsed);
        });
        it('swap Tokens For Exact ETH ERC-20 -> raw-ETH', async function () {
            let balance = web3.utils.toBN(await web3.eth.getBalance(wallet2));
            
            await this.DAI.approve(this.router.address, money.dai('70'), { from: wallet2 });
            let res = await this.router.swapTokensForExactETH(
                money.weth('0.1'),
                money.dai('70'),
                [this.DAI.address, this.WETH.address],
                wallet2,
                constants.ZERO_ADDRESS,
                { from: wallet2 }
            )
            balance = web3.utils.toBN(await web3.eth.getBalance(wallet2)).sub(balance);
            expect(balance).to.be.bignumber.above(money.weth('0.09')); // > 0.09
            console.log("swap Tokens For Exact ETH, gasUsed =", res.receipt.gasUsed);
        });
        it('V swap Exact Tokens For ETH ERC-20 -> raw-ETH', async function () {
            let balance = web3.utils.toBN(await web3.eth.getBalance(wallet2));
            
            await this.DAI.approve(this.router.address, money.dai('70'), { from: wallet2 });
            let res = await this.router.swapExactTokensForETH(
                money.dai('40'),
                [this.DAI.address, this.WETH.address],
                wallet2,
                constants.ZERO_ADDRESS,
                { from: wallet2 }
            )

            balance = web3.utils.toBN(await web3.eth.getBalance(wallet2)).sub(balance);
            expect(balance).to.be.bignumber.above(money.weth('0.09')); // > 0.09
            console.log("swap Tokens For Exact ETH, gasUsed =", res.receipt.gasUsed);
        });
        it('swap ETH For Exact Tokens raw-ETH -> ERC-20', async function () {
            let balance = await this.DAI.balanceOf(wallet2);
            
            let res = await this.router.swapETHForExactTokens(                
                money.dai('30'),
                [this.WETH.address, this.DAI.address],
                wallet2,
                constants.ZERO_ADDRESS,
                { value: money.weth('0.1'), from: wallet2 }
            )
            balance = (await this.DAI.balanceOf(wallet2)).sub(balance);
            expect(balance).to.be.bignumber.equal(money.dai('30.000000000000000314')); // = 30
            console.log("swap Exact Tokens For Tokens for wallet2, gasUsed =", res.receipt.gasUsed);
        });
        it("remove liquidity raw-ETH - ERC-20", async function(){
            let liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet1 });
            await this.LPtoken.approve(this.router.address, liquidity, { from: wallet1 });

            let res = await this.router.removeLiquidityETH(
                this.DAI.address,
                liquidity,
                money.zero,
                money.zero,
                { from: wallet1 });
            
            console.log("Remove liquidity raw-ETH - ERC-20, gasUsed =", res.receipt.gasUsed);
            liquidity = await this.router.getLiquidity(this.WETH.address, this.DAI.address, { from: wallet1 });
            DAIseconddeposite = await this.DAI.balanceOf(wallet1);
            WETHfirstdeposite = await this.WETH.balanceOf(wallet1);

            expect(liquidity).to.be.bignumber.equal(money.zero);
            expect(DAIseconddeposite).to.be.bignumber.above(money.dai('400'));
            expect(WETHfirstdeposite).to.be.bignumber.above(money.weth('1'));
        })
    });
    describe('Creation, swap and remove 1 mln pool DAI-USDC', async function () {
        //beforeEach(async function () {
        it('Make 1 mln pool, swap it, remove liquidity', async function () {
            let res = await this.router.addLiquidity(
                this.USDC.address,
                this.DAI.address,
                money.usdc('1000000'),
                money.dai( '1000000'),
                money.zero,
                money.zero,
                wallet1,
                { from: wallet3 });

            this.emiswap = await this.factory.pools(this.USDC.address, this.DAI.address);
            this.LPtoken = await new Token(this.emiswap);
            const liquidity = await this.router.getLiquidity(this.USDC.address, this.DAI.address, { from: wallet3 });
            expect(liquidity).to.be.bignumber.equal(money.dai('1000000'));
            console.log('//////////////////////////////////// SWAP ///////////////');
            console.log('balance LP  ', (liquidity).div(money.ether('1')).toString());
            console.log("First pair creation with liquidity , gasUsed =", res.receipt.gasUsed);

            await this.router.swapExactTokensForTokens(
                money.dai('1000000'),
                money.usdc('0'),
                [this.DAI.address, this.USDC.address],
                wallet3,
                constants.ZERO_ADDRESS,
                { from: wallet3 }
            )
            console.log('POOL balance USDC', (await this.USDC.balanceOf(this.emiswap)).div(money.usdc('1')).toString());
            console.log('POOL balance DAI ', (await this.DAI.balanceOf(this.emiswap)).div(money.dai('1')).toString());
            console.log('balance USDC', (await this.USDC.balanceOf(wallet3)).div(money.usdc('1')).toString());
            console.log('balance DAI ', (await this.DAI.balanceOf(wallet3)).div(money.dai('1')).toString());

            console.log('//////////////////////////////////// REMOVE LP ///////////////');

            await this.LPtoken.approve(this.router.address, liquidity, { from: wallet3 });
            await this.router.removeLiquidity(
                this.USDC.address, 
                this.DAI.address,
                liquidity,
                money.zero,
                money.zero,
                { from: wallet3 });

            console.log('balance USDC', (await this.USDC.balanceOf(wallet3)).div(money.usdc('1')).toString());
            console.log('balance DAI ', (await this.DAI.balanceOf(wallet3)).div(money.dai('1')).toString());
            console.log('vault balance DAI ', (await this.DAI.balanceOf(vaultWallet)).toString());
            console.log('vault balance USDC', (await this.USDC.balanceOf(vaultWallet)).div(money.usdc('1')).toString());
        })
    });
});