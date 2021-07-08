import {expect} from 'chai';
import { waffle, ethers } from "hardhat";
import {Contract, ContractFactory, utils, constants} from 'ethers';

const f = () => expect.fail("impement me");

const provider = waffle.provider;
const bankName = "GEG ERC20";
const bankSymbol = "gERC20";

const Oracle = require('../build/contracts/OracleV1.sol/OracleV1.json');


describe('Bank::Deposits::Renewal', () => {
    const wallet = provider.getSigner(0);
    const walletOne = provider.getSigner(1);
    const walletTwo = provider.getSigner(2);
    const walletThree = provider.getSigner(3);
    const walletFour = provider.getSigner(4);
    const depositValue = utils.parseEther('0.001'); 
    const productTerm = 86400 * 3 * 30;
    const interest = 5.12 * 100;

    let Bank: InstanceType<typeof ContractFactory>;
    let GEG: InstanceType<typeof ContractFactory>;
    let bank: InstanceType<typeof Contract>;
    let geg: InstanceType<typeof Contract>;
    let mockOracle: InstanceType<typeof Contract>;

 
    describe('deposits', async () => {
        beforeEach(async () => {
            Bank = await ethers.getContractFactory("GErc20");
            GEG = await ethers.getContractFactory("GEG");
            geg = await GEG.connect(wallet).deploy(utils.parseEther('10000000.0'));
            bank = await Bank.connect(wallet).deploy();
            await bank.connect(wallet).initialize(bankName, bankSymbol, productTerm, interest, 0, geg.address, constants.AddressZero, geg.address);
            // await bank.connect(wallet).setUnderlying(geg.address);
            await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
            await geg.connect(walletOne).approve(bank.address, utils.parseEther('1000.0'));
            await wallet.sendTransaction({
                to: bank.address,
                value: depositValue
            });
        })
        
         it('should change deposit autorenewal', async () => {
            await bank.connect(walletOne).deposit(depositValue, true);
            const depositID = await bank.depositIndex();
            let deposit = await bank.deposits(depositID);
            expect(deposit[3]).to.be.true;
            
            await bank.connect(walletOne).setAutoRenewal(depositID, false);
            deposit = await bank.deposits(await bank.depositIndex());
            expect(deposit[3]).to.be.false;
        })
        
    })
 
})