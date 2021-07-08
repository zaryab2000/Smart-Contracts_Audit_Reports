// eslint-disable-next-line no-unused-vars
const { accounts, privateKeys } = require('@openzeppelin/test-environment');
const { ether, expectRevert } = require('@openzeppelin/test-helpers');
const { default: BigNumber } = require('bignumber.js');
const { assert } = require('chai');
const { contract } = require('./twrapper');

const MockUSDX = contract.fromArtifact('MockUSDX');
const MockUSDY = contract.fromArtifact('MockUSDY');
const MockUSDZ = contract.fromArtifact('MockUSDZ');
const MockWBTC = contract.fromArtifact('MockWBTC');

const EmiVoting = contract.fromArtifact('EmiVoting');
const EmiVotableProxyAdmin = contract.fromArtifact('EmiVotableProxyAdmin');
const Proxy = contract.fromArtifact('TransparentUpgradeableProxy');
const EmiVault = contract.fromArtifact('EmiVault');

const { web3 } = MockUSDX;

MockUSDX.numberFormat = 'String';

// eslint-disable-next-line import/order
const { BN } = web3.utils;

let usdx;
let usdy;
let usdz;
let wbtc;

const money = {
    ether,
    eth: ether,
    zero: ether('0'),
    weth: ether,
    dai: ether,
    usdx: ether,
    unregistered_token: ether,
    usdz: (value) => ether(value).div(new BN (1e12)),
    usdy: (value) => ether(value).div(new BN (1e10)),
    usdc: (value) => ether(value).div(new BN (1e12)),
    wbtc: (value) => ether(value).div(new BN (1e10)),
    esw: ether
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
/*oracle wallet hardcoded, so automatic test not run*/
describe.skip('Vault Test', function () {
    const [    bob,     proxyAdmin,     henry,     oracleWallet] = accounts;
    const [bobPriv, proxyAdminPriv, henryPriv, oracleWalletPriv] = privateKeys;

    beforeEach(async function () {
        usdx = await MockUSDX.new();
        usdy = await MockUSDY.new();
        usdz = await MockUSDZ.new();
        wbtc = await MockWBTC.new();

        this.emiVoting = await EmiVoting.new();
        this.emiProxyAdmin = await EmiVotableProxyAdmin.new(this.emiVoting.address, {from: proxyAdmin});
        await this.emiVoting.addAdmin(proxyAdmin);

        this.emiVaultImpl = await EmiVault.new();
        this.emiVaultImpl2 = await EmiVault.new();

        let initVault = await this.emiVaultImpl.contract.methods.initialize().encodeABI();
        let EmiVault_proxy = await Proxy.new(this.emiVaultImpl.address, this.emiProxyAdmin.address, initVault, {from: proxyAdmin});
        vault = await EmiVault.at(EmiVault_proxy.address);
        await vault.setOracle(oracleWallet, {from: proxyAdmin})

        //console.log('vault.ORACLE', await vault.ORACLE());
    });
    describe('Oracle sign EmiVault withdraw', () => {
        beforeEach('get sign and make tx', async function () {
            // coins to EmiVault
            await usdz.transfer(vault.address, money.usdz('110'));
            await wbtc.transfer(vault.address, money.wbtc('220'));
            await usdx.transfer(vault.address, money.usdx('330'));
            await usdy.transfer(vault.address, money.usdy('440'));
        });        
        describe('Oracle sign EmiVault withdraw', async function () {
            beforeEach('prepare sign', async function () {
                // front part 
                // henry ask oracle signature to withdraw from EmiVault 110 usdz, 220 wbtc, 330 usdx, 440 usdy
                // get nonce (number of confirmed transactions) from contract, incrementing for coming transaction
                this.txCount = await vault.getWalletNonce({from: henry}) + 1
                this.amounts = [   
                    money.usdz('10').toString(), 
                    money.wbtc('20').toString(), 
                    money.usdx('30').toString(), 
                    money.usdy('40').toString() ]

                // oracle part
                // get withdraw parameters and make hash of it
                let hash = web3.utils.soliditySha3(
                    {t: 'address[]', v:[usdz.address, wbtc.address, usdx.address, usdy.address]},   // token addresses to withdraw
                    {t: 'uint256[]', v:this.amounts},                                               // amounts of token to withdraw
                    henry,                                                                          // buyer wallet                    
                    this.txCount,                                                                   // nonce (tx number from front)
                    vault.address
                );
                // oracle part
                // sign hash (paramentrs) with oracle_private_key -> get signature and send it back to front
                // core step, this signature contains oracle_wallet (from private key) and hashed parameters
                this.sigObject = await web3.eth.accounts.sign(hash, oracleWalletPriv)
                
                let res = await vault.getMessageHash(
                    [usdz.address, wbtc.address, usdx.address, usdy.address],
                    this.amounts,
                    henry,
                    this.txCount
                );

                assert.equal(this.sigObject.message, res, 'incorrect signed message')
            })
            it('should be same oracle wallet', async function() {
                // sign check, correct signature recover must return signer wallet
                let sigWallet = await web3.eth.accounts.recover(this.sigObject)
                assert.equal(oracleWallet, sigWallet, 'Signature wallet must be equal to recovered sigwallet');
            });
            it('EmiVault should withdraw tokens correctly to henry', async function () {
                // front part
                let res = await vault.withdrawTokens(
                    [usdz.address, wbtc.address, usdx.address, usdy.address],
                    this.amounts,
                    henry,
                    this.txCount,
                    this.sigObject.signature,
                    {from: henry});

                console.log('        vault.withdrawTokens gasUsed', await res.receipt.gasUsed);

                assert.equal(this.amounts[0], (await usdz.balanceOf(henry)).toString(), 'usdz incorrect');
                assert.equal(this.amounts[1], (await wbtc.balanceOf(henry)).toString(), 'usdz incorrect');
                assert.equal(this.amounts[2], (await usdx.balanceOf(henry)).toString(), 'usdz incorrect');
                assert.equal(this.amounts[3], (await usdy.balanceOf(henry)).toString(), 'usdz incorrect');
            });
            it('FRAUD test - vault withdraw should not be signed by bob', async function () {                
                await expectRevert(
                    vault.withdrawTokens(
                        [usdz.address, wbtc.address, usdx.address, usdy.address],
                        this.amounts,
                        henry,
                        this.txCount,
                        this.sigObject.signature,
                        {from: bob}),
                    'EmiVault:sender');
            });
            it('FRAUD test - vault withdraw should not be send to bob', async function () {                
                await expectRevert(
                    vault.withdrawTokens(
                        [usdz.address, wbtc.address, usdx.address, usdy.address],
                        this.amounts,
                        bob,
                        this.txCount,
                        this.sigObject.signature,
                        {from: bob}),
                    'EmiVault:sign');
            });
            it('FRAUD test - vault withdraw should not be send to henri with incorrect params', async function () {                
                await expectRevert(
                    vault.withdrawTokens(
                        [wbtc.address, usdz.address, usdx.address, usdy.address],
                        this.amounts,
                        henry,
                        this.txCount,
                        this.sigObject.signature,
                        {from: henry}),
                    'EmiVault:sign');

                await expectRevert(
                    vault.withdrawTokens(
                        [usdz.address, wbtc.address, usdx.address, usdy.address],
                        [money.usdz('40').toString(), money.wbtc('20').toString(), money.usdx('30').toString(), money.usdy('40').toString()],
                        henry,
                        this.txCount,
                        this.sigObject.signature,
                        {from: henry}),
                    'EmiVault:sign');

                await expectRevert(
                    vault.withdrawTokens(
                        [usdz.address, wbtc.address, usdx.address, usdy.address],
                        [money.usdz('10').toString(), money.wbtc('20').toString(), money.usdx('30').toString(), money.usdy('40').toString()],
                        henry,
                        this.txCount+1,
                        this.sigObject.signature,
                        {from: henry}),
                    'EmiVault:sign');
            });
        });
    });
})