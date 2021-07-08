import {expect, use} from 'chai';
import { waffle, ethers } from "hardhat";
import {Contract, ContractFactory, utils, constants, BigNumber} from 'ethers';
import {deployContract, solidity} from 'ethereum-waffle';

import {thousand, ethToken} from './helpers/utils';

use(solidity);
use(require('chai-roughly'));
const Oracle = require('../build/contracts/OracleV1.sol/OracleV1.json');

const TEST_AMOUNT = 1;

// const ganache = require("ganache-cli");
// const provider = new ethers.providers.Web3Provider(ganache.provider());

const provider = waffle.provider;
const bankName = "GEG ERC20";
const bankSymbol = "gERC20";

let isBNEqual = (a: BigNumber, b: BigNumber) => {
    let m = a.lt(b)? a: b;
    return a.sub(b).abs().mul(1e6).div(m).eq(0);
}

describe('Bank::Interest::V2', () => {
    const wallet = provider.getSigner(0);
    const walletFrom = provider.getSigner(1);
    const walletTwo = provider.getSigner(2);
    
    let bank: InstanceType<typeof Contract>;
    let mockOracle: InstanceType<typeof ethers.Contract>;
    let geg: InstanceType<typeof Contract>;
    let Bank: InstanceType<typeof ContractFactory>;
    let GEG: InstanceType<typeof ContractFactory>;
    const days = 3 * 30;
    const productTerm = 86400 * days;
    const depositValue = constants.WeiPerEther; 
    const interest = 5;  // 5%
    const fine = 20;
    
    beforeEach(async () => {
        mockOracle = await waffle.deployMockContract(wallet, Oracle.abi);
        await mockOracle.mock.convert.returns(depositValue);

        Bank = await ethers.getContractFactory("contracts/GEther.sol:GEther");
        GEG = await ethers.getContractFactory("contracts/GEG.sol:GEG");
        // geg = await deployContract(wallet, GEG, [utils.parseEther('10000000.0')]);
        geg = await GEG.deploy(utils.parseEther('10000000.0'));
        // bank = await deployContract(wallet, Bank, [productTerm, 0, 0, geg.address, constants.AddressZero]);
        bank = await Bank.deploy();
        await bank.initialize(bankName, bankSymbol, productTerm, interest, fine, geg.address, mockOracle.address);
        // geg = await deployContract(wallet, GEG, [utils.parseEther('10000000000.0')]);
        // bank = await deployContract(wallet, Bank, [productTerm, interest, fine, geg.address, constants.AddressZero]);
        await geg.approve(bank.address, await geg.balanceOf(wallet.getAddress()));
        await bank.setOracle(mockOracle.address);
    })
    
    it('should emit Transfer log', async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        
        let periodDays = 365;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        
        let interest_ = BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e15).sub(1); 

        await expect(bank.accrueInterestOne(await bank.depositIndex(), { gasLimit: 2000000}))
        .to.emit(geg, 'Transfer')
        // // .withArgs(await wallet.getAddress(), await walletFrom.getAddress(), expectedAmount);
    })

    it('should emit AccruedInterest log', async () => {
         await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let periodDays = 365;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        
        let interest_ = BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e15).sub(1);   // 0.05 ether expect, contract returns 0.049...


        await expect(bank.accrueInterestOne(await bank.depositIndex(), {gasLimit: 2000000}))
        .to.emit(bank, 'LogAccruedInterest');
        // .withArgs(await walletFrom.getAddress(), await bank.depositIndex(), expectedAmount);
    })
     it('should not emit AccruedInterest log if no interest', async () => {
         await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });

        // too early to accrue interest

        await expect(bank.accrueInterestOne(await bank.depositIndex(), {gasLimit: 2000000}))
        .to.not.emit(bank, 'LogAccruedInterest');
        // .to.be.revertedWith("Could not claim too often");
    })
    
    it('should transfer proper amount of tokens (1 year)', async () => {
        await bank.connect(walletFrom).deposit(true, {value: depositValue});
        let periodDays = 365;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period + 1]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block

        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), 365*24*12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        
        // let interest_ = BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
        
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue);
        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
        let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        let m_= actualAmount.lt(expectedAmount)? actualAmount : expectedAmount;
        // console.log(`expected: ${expectedAmount}`);
        // console.log(`actual:   ${actualAmount.toString().padStart(20)}`);
        // console.log(`expected: ${utils.formatEther(expectedAmount)}`);
        // console.log(`actual:   ${utils.formatEther(actualAmount)}`);
        // console.log(`diff:     ${actualAmount.sub(expectedAmount).abs().toString().padStart(20)}`)
        // console.log(`min: ${m_}`);
        // console.log(`diff:     ${actualAmount.sub(expectedAmount).abs().mul(1e6).div(m_).toString().padStart(20)}`)

        expect(isBNEqual(expectedAmount, actualAmount)).to.be.true;
        
    })
    it('should not transfer proper amount of tokens (next day)', async () => {
        let abi = [ "event LogUint(string indexed s, unit256 indexed x)" ];
let iface = new ethers.utils.Interface(abi);
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let periodDays = 1;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period + 1]);   // add 1 days
        provider.send("evm_mine", []);       // mine the next block
        
        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), 24*12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        // let interest_ = BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
        
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue); 
        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
        let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        // console.log(bank.filters.LogUint(null, null));
        // bank.on("LogUint", (s, x) => {
            // console.log(`Event "${s.toString()}" (${x.toString()})`);
        // })

        expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
    })
    it('should transfer proper amount of tokens (2 days)', async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let periodDays = 2;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        
        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), 2 * 24*12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue); 

        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
        let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
    })
     it('should transfer proper amount of tokens (14 hours)', async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let periods = 14;
        
        provider.send("evm_increaseTime", [60*60*14 + 1]);   // add 14 hours
        provider.send("evm_mine", []);       // mine the next block
        
        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), 14 *12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue); 
        // console.log(utils.formatUnits(expectedAmount));
        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
        let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
    })
    it('should not transfer on same day', async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let periodDays = 2;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        
        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), 2 * 24 *12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue); 
        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
        let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
        
        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
        let actualAmount2 = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(isBNEqual(actualAmount2, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
    })
    it('should consider previous payouts', async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let periodDays = 2;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        
        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), 2 * 24 *12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue); 
        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
        let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(isBNEqual(expectedAmount, actualAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
        
        provider.send("evm_increaseTime", [period]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        await expect(async () => bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex()), "should accrue")
        .to.changeTokenBalance(geg, walletFrom, actualAmount);
    })


    it('should transfer multiple accounts', async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        await walletTwo.sendTransaction({
            to: bank.address,
            value: depositValue
        });

        let periodDays = 2;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), 2 * 24 *12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue); 
        
        await bank.connect(walletFrom).accrueInterestAll();
        let actualAmountOne = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        let actualAmountTwo = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(isBNEqual(expectedAmount, actualAmountOne), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmountOne)}`).to.be.true;
        expect(isBNEqual(expectedAmount, actualAmountTwo), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmountTwo)}`).to.be.true;
    })
    it('should accrue interst after withdrawal',async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        
        let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), days * 24 *12)*1e13;
        let interest_ = BigNumber.from(intrestJS.toFixed());
        let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue); 
        provider.send("evm_increaseTime", [productTerm + 1]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        await bank.connect(walletFrom).makeWithdrawal(1);
        let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
    } )

    it('should not accrue if deposit is closed', async () => {
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });

        provider.send("evm_increaseTime", [productTerm + 1]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        await bank.connect(walletFrom).makeWithdrawal(1);
        await expect(bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())).to.be.revertedWith("Deposit is closed.");
    })

    describe('renewal', () => {
        it('should not claim after expire (legacy)', async() => {
            await walletFrom.sendTransaction({
                to: bank.address,
                value: depositValue
            });
    
            // await bank.connect(walletFrom).deposit( depositValue);

            let periodDays = 180;
            let period = 86400*periodDays;
            expect(period).to.equal(productTerm * 2);
            
            provider.send("evm_increaseTime", [period + 1]);   // add 1 year
            provider.send("evm_mine", []);       // mine the next block
    
            let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), days*24*12)*1e13;
            let interest_ = BigNumber.from(intrestJS.toFixed());
            
            // let interest_ = BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
            
            let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue);
            await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
            let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
    
            expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
        })

        it('should not claim after expire (new)', async() => {
            // await walletFrom.sendTransaction({
            //     to: bank.address,
            //     value: depositValue
            // });
    
            await bank.connect(walletFrom).deposit(false, {value: depositValue});

            let periodDays = 180;
            let period = 86400*periodDays;
            expect(period).to.equal(productTerm * 2);
            
            provider.send("evm_increaseTime", [period + 1]);   // add 1 year
            provider.send("evm_mine", []);       // mine the next block
    
            let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), days*24*12)*1e13;
            let interest_ = BigNumber.from(intrestJS.toFixed());
            
            // let interest_ = BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
            
            let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue);
            await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
            let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
    
            expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
        })

        it('should claim after expire (new)', async() => {
            await bank.connect(walletFrom).deposit(true, {value: depositValue});

            let periodDays = 180;
            let period = 86400*periodDays;
            expect(period).to.equal(productTerm * 2);
            
            provider.send("evm_increaseTime", [period + 1]);   // add 1 year
            provider.send("evm_mine", []);       // mine the next block
    
            let intrestJS = Math.pow(1 + interest / (10000* 365 * 24 * 12), periodDays*24*12)*1e13;
            let interest_ = BigNumber.from(intrestJS.toFixed());
            
            // let interest_ = BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
            
            let expectedAmount = depositValue.mul(interest_).div(1e13).sub(depositValue);
            await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex())
            let actualAmount = BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
    
            expect(isBNEqual(actualAmount, expectedAmount), `expected  vs actual: ${utils.formatEther(expectedAmount)} != ${utils.formatEther(actualAmount)}`).to.be.true;
        })

    })
})
