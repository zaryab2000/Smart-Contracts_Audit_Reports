import {expect, use} from 'chai';
import { waffle, ethers } from "hardhat";
import {Contract, ContractFactory, utils, constants, BigNumber} from 'ethers';
import {ethToken} from './helpers/utils';

// import {deployMockContract} from '@ethereum-waffle/mock-contract';
// import {deployContract, solidity, MockProvider} from 'waffle';
// const { deployContract } = waffle;

use(waffle.solidity);

// const oracleAbi = '[{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"},{"internalType":"address","name":"_accessController","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"int256","name":"current","type":"int256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"updatedAt","type":"uint256"}],"name":"AnswerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":true,"internalType":"address","name":"startedBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"startedAt","type":"uint256"}],"name":"NewRound","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"accessController","outputs":[{"internalType":"contract AccessControllerInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"aggregator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"confirmAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_roundId","type":"uint256"}],"name":"getAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_roundId","type":"uint256"}],"name":"getTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"","type":"uint16"}],"name":"phaseAggregators","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"phaseId","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"proposeAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"proposedAggregator","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"proposedGetRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proposedLatestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_accessController","type":"address"}],"name":"setController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
// const ganache = require("ganache-cli");
// const provider = new ethers.providers.Web3Provider(ganache.provider({ gasLimit: 80000000 }));

// const provider = new waffle.MockProvider();
const provider = waffle.provider;

describe('Oracle::V2', () => {
    
    let geg: InstanceType<typeof ethers.Contract>;
    let usdt: InstanceType<typeof ethers.Contract>;
    let oracle: InstanceType<typeof ethers.Contract>;
    let ERC20: InstanceType<typeof ContractFactory>;
    let GEG: InstanceType<typeof ContractFactory>;
    
    const wallet = provider.getSigner(0);
    const walletFrom = provider.getSigner(1);
    beforeEach(async () => {
        ERC20 = await ethers.getContractFactory("ERC20");
        usdt = await ERC20.deploy("USDT", "USDT");
        // console.log(`usdt address: ${usdt.address}`);
        GEG = await ethers.getContractFactory("contracts/GEG.sol:GEG");
        // geg = await deployContract(wallet, GEG, [utils.parseEther('10000000.0')]);
        geg = await GEG.deploy(utils.parseEther('10000000.0'));
 
        const Oracle = await ethers.getContractFactory("contracts/OracleV1.sol:OracleV1");
        oracle = await Oracle.connect(wallet).deploy();
        await oracle.initialize();
    })
    describe('ETH', async () => {
        it('should raise if no conversion rate', async() => {
            let input = ethers.utils.parseEther("1000.0");
            await expect(oracle.convert(ethToken, input)).to.be.revertedWith('Zero convertion rate.');
        }) 
        
        it('should update and convert ETH', async () => {
            await oracle.connect(wallet).setETHrate(ethers.utils.parseEther("7.0"));
            let input = ethers.utils.parseEther("5.0");
            expect(await oracle.connect(wallet).convert(ethToken, input)).to.equal(ethers.utils.parseEther("35.0"));
        })
    })
    describe('tokens', async () => {
        it('should set and get conversion rate', async () => {
            await oracle.connect(wallet).setRate(usdt.address, ethers.utils.parseEther("17.0"));
            /*
            1 usdt == 17 GEG
            2 usdt == 24 GEG
            */
            expect(await oracle.connect(wallet).convert(usdt.address, ethers.utils.parseEther("2.0"))).to.equal(ethers.utils.parseEther("34.0"))
        })

        it('should not convert geg to geg', async () => {
            await oracle.setToken(geg.address);
            expect(await oracle.connect(wallet).convert(geg.address, ethers.utils.parseEther("2.0"))).to.equal(ethers.utils.parseEther("2.0"))
        })

        it('should raise if no conversion rate', async() => {
            let input = ethers.utils.parseEther("1000.0");
            await expect(oracle.convert(usdt.address, input)).to.be.revertedWith('Zero convertion rate.');
        })
    })
    
})