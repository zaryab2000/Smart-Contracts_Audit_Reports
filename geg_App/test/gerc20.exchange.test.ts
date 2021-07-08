import {expect, use} from 'chai';
import { waffle, ethers } from "hardhat";
// import {Contract, ContractFactory, utils, constants, BigNumber, ethers} from 'ethers';
// import {deployMockContract} from '@ethereum-waffle/mock-contract';
// import {deployContract, solidity, MockProvider} from 'waffle';
// const { deployContract } = waffle;

import {Contract, ContractFactory, utils, constants} from 'ethers';
import { basename } from 'path';
use(waffle.solidity);
const Oracle = require('../build/contracts/OracleV1.sol/OracleV1.json');

// const oracleAbi = '[{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"},{"internalType":"address","name":"_accessController","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"int256","name":"current","type":"int256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"updatedAt","type":"uint256"}],"name":"AnswerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":true,"internalType":"address","name":"startedBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"startedAt","type":"uint256"}],"name":"NewRound","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"accessController","outputs":[{"internalType":"contract AccessControllerInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"aggregator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"confirmAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_roundId","type":"uint256"}],"name":"getAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_roundId","type":"uint256"}],"name":"getTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"","type":"uint16"}],"name":"phaseAggregators","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"phaseId","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"proposeAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"proposedAggregator","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"proposedGetRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proposedLatestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_accessController","type":"address"}],"name":"setController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
// const ganache = require("ganache-cli");
// const provider = new ethers.providers.Web3Provider(ganache.provider({ gasLimit: 80000000 }));

// const provider = new waffle.MockProvider();
const provider = waffle.provider;
const bankName = "GEG ETH";
const bankSymbol = "gETH";

describe('gERC20::Exchange::V3', () => {
    
    let bank: InstanceType<typeof ethers.Contract>;
    let geg: InstanceType<typeof ethers.Contract>;
    let oracle: InstanceType<typeof ethers.Contract>;
    let mockOracle: InstanceType<typeof ethers.Contract>;
    let Bank: InstanceType<typeof ethers.ContractFactory>;
    let GEG: InstanceType<typeof ethers.ContractFactory>;
    // let Oracle: InstanceType<typeof ethers.ContractFactory>;
    const depositValue = ethers.constants.WeiPerEther; 
    const interest = 5;
    
    const wallet = provider.getSigner(0);
    const walletFrom = provider.getSigner(1);
    beforeEach(async () => {
        mockOracle = await waffle.deployMockContract(wallet, Oracle.abi);
        Bank = await ethers.getContractFactory("contracts/GErc20.sol:GErc20");
        GEG = await ethers.getContractFactory("contracts/GEG.sol:GEG");
        geg = await GEG.connect(wallet).deploy(ethers.utils.parseEther('10000000.0'));
        bank = await Bank.connect(wallet).deploy();
        // bank.on("LogUint", (s, x) => {
            // console.log(`Event "${s.toString()}" (${x.toString()})`);
        // });
        await bank.initialize(bankName, bankSymbol, 0, 5, 0, geg.address, mockOracle.address, geg.address);
        await geg.approve(bank.address, await geg.balanceOf(wallet.getAddress()));
        // await bank.setOracle(mockOracle.address);
        // await bank.connect(wallet).setUnderlying(geg.address);
        await geg.connect(wallet).transfer(walletFrom.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(walletFrom).approve(bank.address, utils.parseEther('1000.0'));
    })
    
    it('should call ETH oracle', async () => {
        await bank.connect(walletFrom).deposit(depositValue, true);
        let periodDays = 365;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period + 1]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block
        
        let interest_ = ethers.BigNumber.from((((interest * periodDays / 365))*1e13).toFixed());
        
        await mockOracle.mock.convert.returns(ethers.utils.parseEther("999"));
        
        let expectedAmount = depositValue.mul(interest_).div(1e15).mul(999); 
        await bank.connect(walletFrom).accrueInterestOne(await bank.depositIndex());
        let actualAmount = ethers.BigNumber.from(await geg.balanceOf(walletFrom.getAddress()));
        expect(expectedAmount.sub(actualAmount).div(expectedAmount).abs().lte(1e6), `${ethers.utils.formatEther(actualAmount)} (actual) != ${ethers.utils.formatEther(expectedAmount)} (expected)`).to.be.true;
    })
    
    it('should change Oracle', async () => {
        await bank.connect(walletFrom).deposit(depositValue, true);

        let periodDays = 365;
        let period = 86400*periodDays;
        
        provider.send("evm_increaseTime", [period + 1]);   // add 1 year
        provider.send("evm_mine", []);       // mine the next block

        let mockOracleV2 = await waffle.deployMockContract(wallet, Oracle.abi);
        await mockOracleV2.mock.convert.revertsWithReason('Should fail.')
       await bank.setOracle(mockOracleV2.address);
        
        await expect(bank.connect(wallet).accrueInterestOne(await bank.depositIndex())).to.be.revertedWith("Should fail.");
    })

    it('shoould prevent change Oracle by non-admin', async () => {
       await expect(bank.connect(walletFrom).setOracle(mockOracle.address)).to.be.revertedWith('Ownable');
    })
    
})
