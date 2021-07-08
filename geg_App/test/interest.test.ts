import {expect, use} from 'chai';
import { waffle, ethers } from "hardhat";
import {Contract, ContractFactory, utils, constants, BigNumber} from 'ethers';
import {deployContract, solidity} from 'ethereum-waffle';

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
    // return a.sub(b).abs().div(a).lte(1e6);
}

describe('Bank(Interest)', () => {
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
        // .withArgs(await wallet.getAddress(), await walletFrom.getAddress(), expectedAmount);
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
        .to.emit(bank, 'LogAccruedInterest')
        // .withArgs(await walletFrom.getAddress(), await bank.depositIndex(), expectedAmount);
    })
     it('should not emit AccruedInterest log if no interest', async () => {
         await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });

        // too early to accrue interest

        await expect(bank.accrueInterestOne(await bank.depositIndex(), {gasLimit: 2000000}))
        .to.not.emit(bank, 'LogAccruedInterest')
        // .to.be.revertedWith("Could not claim too often");
    })


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
})
