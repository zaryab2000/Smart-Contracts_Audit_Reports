import {expect, use} from 'chai';
import {waffle, ethers} from "hardhat";
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, utils, constants } from 'ethers';
import {fail, thousand, ethToken} from './helpers/utils';

use(solidity);
const provider = waffle.provider;
const bankName = "GEG ERC20";
const bankSymbol = "gERC20";

describe('Signature', () => {
    const owner = provider.getSigner(0);
    const user = provider.getSigner(1);
    

    let geg: InstanceType<typeof ethers.Contract>;
    let usdt: InstanceType<typeof ethers.Contract>;
    let oracle: InstanceType<typeof ethers.Contract>;
    let bank: InstanceType<typeof Contract>;
    let ERC20: InstanceType<typeof ContractFactory>;
    let GEG: InstanceType<typeof ContractFactory>;
    let Bank: InstanceType<typeof ContractFactory>;
    let now = Math.floor(Date.now() / 1000);
 
    beforeEach(async () => {
        ERC20 = await ethers.getContractFactory("contracts/mockERC20.sol:MockErc20");
        usdt = await ERC20.connect(owner).deploy("USDT", "USDT", utils.parseEther('10000000.0'));
        
        GEG = await ethers.getContractFactory("contracts/GEG.sol:GEG");
        
        geg = await GEG.deploy(utils.parseEther('10000000.0'));
        const Oracle = await ethers.getContractFactory("contracts/OracleV1.sol:OracleV1");

        oracle = await Oracle.connect(owner).deploy();

        await oracle.initialize();
        Bank = await ethers.getContractFactory("GErc20");
        bank = await Bank.connect(owner).deploy();

        await geg.connect(owner).approve(bank.address, utils.parseEther('1000.0'));

        await bank.connect(owner).initialize(bankName, bankSymbol, 86400 * 3 * 30, 512, 0, geg.address, oracle.address, usdt.address);
        await usdt.connect(owner).transfer(user.getAddress(), thousand.mul(2));

        await usdt.connect(user).approve(bank.address, utils.parseEther('1000.0'));
        await bank.connect(user).deposit(thousand, true);
    })

    it('should accept valid message', async () => {
        // console.log("Owner:", await owner.getAddress());
        let rate = ethers.utils.parseEther("7.0");
        // console.log(`token: ${ethToken}`)
        // console.log(`rate: ${rate.toString()}`)
        // console.log(`now: ${now}`)

        let payload = ethers.utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [ethToken, rate, now]);
        // console.log(`payload: ${payload}`);

        let payloadHash = ethers.utils.keccak256(payload);
        // console.log(`hashed: ${payloadHash}`);

        let sign = await owner.signMessage(ethers.utils.arrayify(payloadHash));
        // console.log(`signature: ${sign}`)

        await oracle.connect(user).setRateSigned(ethToken, rate, now, sign);

        let input = ethers.utils.parseEther("5.0");
        expect(await oracle.connect(user).convert(ethToken, input)).to.equal(ethers.utils.parseEther("35.0"));

    })


    it('should reject non owner', async () => {
        // console.log("Owner:", await owner.getAddress());
        let rate = ethers.utils.parseEther("7.0");

        let payload = ethers.utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [ethToken, rate, now]);
        let payloadHash = ethers.utils.keccak256(payload);
        let sign = await user.signMessage(ethers.utils.arrayify(payloadHash));

        await oracle.connect(user).setRateSigned(ethToken, rate, now, sign);
        await expect(oracle.convert(ethToken, thousand)).to.be.revertedWith('Zero convertion rate.');

    })


    it('should reject invalid message' , async() => {
        let sign = await owner.signMessage("hello");

        await oracle.connect(user).setRateSigned(ethToken, ethers.utils.parseEther("7.0"), now, sign);
        let input = ethers.utils.parseEther("5.0");
        await expect(oracle.convert(ethToken, input)).to.be.revertedWith('Zero convertion rate.');
    })

    it('should reject events from past', async() => {
        await oracle.connect(owner).setRate(ethToken, ethers.utils.parseEther("17.0"));

        provider.send("evm_increaseTime", [2*60*60]);   // two hours later
        provider.send("evm_mine", []);       // mine the next block

        await expect(oracle.connect(user).setRateSigned(ethToken, ethers.utils.parseEther("7.0"), now, ethers.utils.formatBytes32String("blabla"))).to.be.revertedWith('Convertion rate is too old.');
    })

    it('should update rates from bank', async() => {
        let rate = ethers.utils.parseEther("7.0");
        let payload = ethers.utils.defaultAbiCoder.encode(["address", "uint256", "uint256"], [usdt.address, rate, now]);
        let payloadHash = ethers.utils.keccak256(payload);
        let sign = await owner.signMessage(ethers.utils.arrayify(payloadHash));

        await bank.connect(user).accrueInterestOneWithRates(await bank.depositIndex(), rate, now, sign );

        expect(await oracle.connect(user).convert(usdt.address, thousand)).to.equal(thousand.mul(7));

    })
})