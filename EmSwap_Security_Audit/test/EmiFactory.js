const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');
const { contract } = require('./twrapper');

const Emiswap = contract.fromArtifact('Emiswap');
const EmiFactory = contract.fromArtifact('EmiFactory');
const TokenWithBytes32SymbolMock = contract.fromArtifact('TokenWithBytes32SymbolMock');
const TokenWithStringSymbolMock = contract.fromArtifact('TokenWithStringSymbolMock');
const TokenWithBytes32CAPSSymbolMock = contract.fromArtifact('TokenWithBytes32CAPSSymbolMock');
const TokenWithStringCAPSSymbolMock = contract.fromArtifact('TokenWithStringCAPSSymbolMock');
const TokenWithNoSymbolMock = contract.fromArtifact('TokenWithNoSymbolMock');

//import { bytecode } from '@uniswap/v2-core/build/UniswapV2Pair.json'
const { pack, keccak256 } = require('@ethersproject/solidity')
const { getCreate2Address } = require('@ethersproject/address')

describe('EmiFactory', function () {
    const [_, wallet1, wallet2] = accounts;
    beforeEach(async function () {
        this.factory = await EmiFactory.new();
        // code length 
        //console.log(this.factory.constructor._json.bytecode.length);
    });
    // temporary skip
    describe.skip('Symbol', async function () {
        it('should handle bytes32 symbol', async function () {
            const token1 = await TokenWithBytes32SymbolMock.new(web3.utils.toHex('ABC'));
            const token2 = await TokenWithStringSymbolMock.new('XYZ');
            await this.factory.deploy(token1.address, token2.address);

            const pool = await Emiswap.at(await this.factory.pools(token1.address, token2.address));
            if (token1.address.localeCompare(token2.address, undefined, { sensitivity: 'base' }) < 0) {
                expect(await pool.symbol()).to.be.equal('EMI-V1-ABC-XYZ');
                expect(await pool.name()).to.be.equal('Emiswap V1 (ABC-XYZ)');
            } else {
                expect(await pool.symbol()).to.be.equal('EMI-V1-XYZ-ABC');
                expect(await pool.name()).to.be.equal('Emiswap V1 (XYZ-ABC)');
            }
        });

        it('should handle 33-char len symbol', async function () {
            const token1 = await TokenWithStringSymbolMock.new('012345678901234567890123456789123');
            const token2 = await TokenWithStringSymbolMock.new('XYZ');
            await this.factory.deploy(token1.address, token2.address);

            const pool = await Emiswap.at(await this.factory.pools(token1.address, token2.address));
            if (token1.address.localeCompare(token2.address, undefined, { sensitivity: 'base' }) < 0) {
                expect(await pool.symbol()).to.be.equal('EMI-V1-012345678901234567890123456789123-XYZ');
                expect(await pool.name()).to.be.equal('Emiswap V1 (012345678901234567890123456789123-XYZ)');
            } else {
                expect(await pool.symbol()).to.be.equal('EMI-V1-XYZ-012345678901234567890123456789123');
                expect(await pool.name()).to.be.equal('Emiswap V1 (XYZ-012345678901234567890123456789123)');
            }
        });

        it('should handle tokens without symbol', async function () {
            const token1 = await TokenWithNoSymbolMock.new();
            const token2 = await TokenWithStringSymbolMock.new('XYZ');
            await this.factory.deploy(token1.address, token2.address);

            const pool = await Emiswap.at(await this.factory.pools(token1.address, token2.address));
            if (token1.address.localeCompare(token2.address, undefined, { sensitivity: 'base' }) < 0) {
                expect(await pool.symbol()).to.be.equal('EMI-V1-' + token1.address.toLowerCase() + '-XYZ');
                expect(await pool.name()).to.be.equal('Emiswap V1 (' + token1.address.toLowerCase() + '-XYZ)');
            } else {
                expect(await pool.symbol()).to.be.equal('EMI-V1-XYZ-' + token1.address.toLowerCase());
                expect(await pool.name()).to.be.equal('Emiswap V1 (XYZ-' + token1.address.toLowerCase() + ')');
            }
        });

        it('should handle tokens with empty string symbol', async function () {
            const token1 = await TokenWithStringSymbolMock.new('');
            const token2 = await TokenWithStringSymbolMock.new('XYZ');
            await this.factory.deploy(token1.address, token2.address);

            const pool = await Emiswap.at(await this.factory.pools(token1.address, token2.address));
            if (token1.address.localeCompare(token2.address, undefined, { sensitivity: 'base' }) < 0) {
                expect(await pool.symbol()).to.be.equal('EMI-V1-' + token1.address.toLowerCase() + '-XYZ');
                expect(await pool.name()).to.be.equal('Emiswap V1 (' + token1.address.toLowerCase() + '-XYZ)');
            } else {
                expect(await pool.symbol()).to.be.equal('EMI-V1-XYZ-' + token1.address.toLowerCase());
                expect(await pool.name()).to.be.equal('Emiswap V1 (XYZ-' + token1.address.toLowerCase() + ')');
            }
        });

        it('should handle tokens with empty bytes32 symbol', async function () {
            const token1 = await TokenWithBytes32SymbolMock.new('0x');
            const token2 = await TokenWithStringSymbolMock.new('XYZ');
            await this.factory.deploy(token1.address, token2.address);

            const pool = await Emiswap.at(await this.factory.pools(token1.address, token2.address));
            if (token1.address.localeCompare(token2.address, undefined, { sensitivity: 'base' }) < 0) {
                expect(await pool.symbol()).to.be.equal('EMI-V1-' + token1.address.toLowerCase() + '-XYZ');
                expect(await pool.name()).to.be.equal('Emiswap V1 (' + token1.address.toLowerCase() + '-XYZ)');
            } else {
                expect(await pool.symbol()).to.be.equal('EMI-V1-XYZ-' + token1.address.toLowerCase());
                expect(await pool.name()).to.be.equal('Emiswap V1 (XYZ-' + token1.address.toLowerCase() + ')');
            }
        });

        it('should handle tokens with CAPS symbol', async function () {
            const token1 = await TokenWithBytes32CAPSSymbolMock.new(web3.utils.toHex('caps1'));
            const token2 = await TokenWithStringCAPSSymbolMock.new('caps2');
            await this.factory.deploy(token1.address, token2.address);

            const pool = await Emiswap.at(await this.factory.pools(token1.address, token2.address));
            if (token1.address.localeCompare(token2.address, undefined, { sensitivity: 'base' }) < 0) {
                expect(await pool.symbol()).to.be.equal('EMI-V1-caps1-caps2');
                expect(await pool.name()).to.be.equal('Emiswap V1 (caps1-caps2)');
            } else {
                expect(await pool.symbol()).to.be.equal('EMI-V1-caps2-caps1');
                expect(await pool.name()).to.be.equal('Emiswap V1 (caps2-caps1)');
            }
        });
    });
    // temporary skip
    describe('Creation', async function () {
        it('should do not work for same token', async function () {
            const token1 = await TokenWithStringSymbolMock.new('ABC');
            
            await expectRevert(
                this.factory.deploy(token1.address, token1.address),
                'Factory:no same tokens',
            );
        });

        it('should do not allow twice pool creation even flipped', async function () {
            const token1 = await TokenWithStringSymbolMock.new('ABC');
            const token2 = await TokenWithStringSymbolMock.new('XYZ');
            let tx = await this.factory.deploy(token1.address, token2.address);

            //console.log('tx', tx);

            await expectRevert(
                this.factory.deploy(token1.address, token2.address),
                'Factory:pool already exists',
            );

            await expectRevert(
                this.factory.deploy(token2.address, token1.address),
                'Factory:pool already exists',
            );
        });
        it('should pool created by token description', async function () {
            const token1 = await TokenWithStringSymbolMock.new('ABC');
            const token2 = await TokenWithStringSymbolMock.new('XYZ');

            const INIT_CODE_HASH = keccak256(['bytes'], [`${Emiswap.bytecode}`])

            let tx = await this.factory.deploy(token1.address, token2.address);

            const pool = await Emiswap.at(await this.factory.pools(token1.address, token2.address));

            console.log('pool token name', await pool.name(), '|', 'pool token symbol', await pool.symbol(), '|');

            let calcedPoolAddress = 
                (BigInt(token1.address) < BigInt(token2.address) ?             
                    getCreate2Address(
                        this.factory.address,
                        keccak256(['bytes'], [pack(['address', 'address'], [token1.address, token2.address])]),
                        INIT_CODE_HASH
                    )
                    : getCreate2Address(
                        this.factory.address,
                        keccak256(['bytes'], [pack(['address', 'address'], [token2.address, token1.address])]),
                        INIT_CODE_HASH
                    )
                )
            console.log('tx', tx.receipt.gasUsed, 'created pool', pool.address); // mooni new 3503965 gas
            console.log('calced pool address    ', calcedPoolAddress)
            assert(pool.address, calcedPoolAddress, 'Calced and created pool address not equal!');


            let tokenWETHaddr = '0x436A822ed52422ed1759DCE74e2cf3f89Ce81Be0'
            let tokenDAIaddr  = '0x1cC52216E4037BB55dCD950E6ed97aa15C8a4b66'
            let factoryAddr   = '0x756346EB588e30F7C8d1F525C90Fb6e704e9142B'
            let calcedPoolAddress2 = 
                (BigInt(tokenWETHaddr) < BigInt(tokenDAIaddr) ?
                    getCreate2Address(
                        factoryAddr,
                        keccak256(['bytes'], [pack(['address', 'address'], [tokenWETHaddr, tokenDAIaddr])]),
                        INIT_CODE_HASH
                    )
                    : getCreate2Address(
                        factoryAddr,
                        keccak256(['bytes'], [pack(['address', 'address'], [tokenDAIaddr, tokenWETHaddr])]),
                        INIT_CODE_HASH
                    )
                )
            console.log('calced pool address2   ', calcedPoolAddress2)
        });
    });
});
