import { expect } from 'chai';
import { waffle, ethers, upgrades } from "hardhat";
import {Contract, ContractFactory, utils, constants, BigNumber, providers} from 'ethers';

const provider = waffle.provider;
const depositValue = ethers.constants.WeiPerEther; 
const productTerm = 86400 * 3 * 30;
const interest = 534;
const bankName = "GEG ERC20";
const bankSymbol = "gERC20";

describe('Bank (Proxy)', () => {
    let Bank: InstanceType<typeof ethers.ContractFactory>;
    let BankV2: InstanceType<typeof ethers.ContractFactory>;
    
    
    const wallet = provider.getSigner(0);
    const walletFrom = provider.getSigner(1);
    beforeEach(async function () {
        Bank = await ethers.getContractFactory("contracts/GEther.sol:GEther");
        BankV2 = await ethers.getContractFactory("contracts/GEther.sol:GEther");
        // Deploy a new Box contract for each test
    })
    
    it('should deploy proxy', async () => {
        const bank = await upgrades.deployProxy(Bank, [ bankName, bankSymbol, productTerm, interest, 0, constants.AddressZero, constants.AddressZero], {initializer: "initialize", unsafeAllowCustomTypes: true});
        
        await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let receipt = await walletFrom.sendTransaction({
            to: bank.address,
            value: depositValue
        });
        let tx = await provider.getTransaction(receipt.hash)
        let block = await provider.getBlock((await tx.wait()).blockHash);


        const bank2 = await upgrades.upgradeProxy(bank.address, BankV2, {unsafeAllowCustomTypes: true});
        
        const deposit = await bank2.deposits(await bank2.depositIndex());
        
        expect(deposit[0]).to.equals(await walletFrom.getAddress());
        expect(deposit[1]).to.be.true;
        expect(deposit[2]).to.be.false;
        expect(deposit[3]).to.be.false;
        expect(deposit[4]).to.equal(depositValue);
        expect(deposit[5]).to.equal(0);
        expect(deposit[6]).to.equal(block.timestamp);
        // expect(deposit[7]).to.equal(block.timestamp + productTerm);
        
    })
})