import {expect} from 'chai';
import { waffle, ethers } from "hardhat";
import {Contract, ContractFactory, utils, constants, BigNumber, providers} from 'ethers';

const f = () => expect.fail("impement me");

const provider = waffle.provider;
const bankName = "GEG ERC20";
const bankSymbol = "gERC20";

const Oracle = require('../build/contracts/OracleV1.sol/OracleV1.json');

describe('Bank::gETH::v1', () => {
    const wallet = provider.getSigner(0);
    const walletOne = provider.getSigner(1);
    const walletTwo = provider.getSigner(2);
    const walletThree = provider.getSigner(3);
    const walletFour = provider.getSigner(4);
    
    const productTerm = 86400 * 3 * 30;
    const interest = 5.12 * 100;
    const depositValue = utils.parseEther('0.000001'); 
    let bank: InstanceType<typeof Contract>;
    let geg: InstanceType<typeof Contract>;
    let mockOracle: InstanceType<typeof Contract>;
    let Bank: InstanceType<typeof ContractFactory>;
    let GEG: InstanceType<typeof ContractFactory>;
    
    beforeEach(async () => {
        mockOracle = await waffle.deployMockContract(wallet, Oracle.abi);
        await mockOracle.mock.convert.returns(depositValue);
        Bank = await ethers.getContractFactory("GEther");
        GEG = await ethers.getContractFactory("GEG");
        geg = await GEG.connect(wallet).deploy(utils.parseEther('10000000.0'));
        bank = await Bank.connect(wallet).deploy();
        await bank.connect(wallet).initialize(bankName, bankSymbol, productTerm, interest, 0, geg.address, constants.AddressZero);

    });
    
    it('should deploy contranct', async () => {});
    
    describe('owner only', async () => {
        it('should have owner', async () => {
            const owner_ = await bank.owner();
            
            expect(await wallet.getAddress()).to.equal(owner_);
        });
        
        it('should withdraw money to owner', async () => {
            await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            
            await expect(await bank.withdraw(depositValue))
            .to.changeEtherBalances([bank, wallet], [-depositValue, depositValue]);
        })
        
        it('should not allow withdraw by non-admin', async () => {
            await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            
            await expect( bank.connect(walletOne).withdraw(depositValue)).to.be.revertedWith("Ownable: caller is not the owner");
            await expect( bank.connect(walletTwo).withdraw(depositValue)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    })
    
    
    describe('deposits', async () => {
        it('should start with 0 deposit', async () => {
            expect(await bank.depositIndex()).to.equal(0);
            expect(await bank.depositValue()).to.equal(0);
        })
        
        it('should add deposit', async() => {
            const prevQty = await bank.depositIndex();
            const prevVal = await bank.depositValue();
            
            await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            
            expect(await bank.depositIndex()).to.equal(prevQty.add(1));
            expect(await bank.depositValue()).to.equal(prevVal.add(depositValue));
            
        })
        
        it('should store deposit info', async () => {
            let receipt = await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            let tx = await provider.getTransaction(receipt.hash)
            let block = await provider.getBlock((await tx.wait()).blockHash);
            
            const deposit = await bank.deposits(await bank.depositIndex());
            
            expect(deposit[0]).to.equals(await walletOne.getAddress());
            expect(deposit[1]).to.be.true;
            expect(deposit[2]).to.be.false;
            expect(deposit[3]).to.be.false;
            expect(deposit[4]).to.equal(depositValue);
            expect(deposit[5]).to.equal(0);
            expect(deposit[6]).to.equal(block.timestamp);
            // expect(deposit[7]).to.equal(block.timestamp + productTerm);
        })

        it('should store deposit info with autorenewal', async () => {
            let receipt = await bank.connect(walletOne).deposit(true, {value: depositValue});
            let tx = await provider.getTransaction(receipt.hash)
            let block = await provider.getBlock((await tx.wait()).blockHash);
            
            const deposit = await bank.deposits(await bank.depositIndex());
            
            expect(deposit[0]).to.equals(await walletOne.getAddress());
            expect(deposit[1]).to.be.true;
            expect(deposit[2]).to.be.false;
            expect(deposit[3]).to.be.true;
            expect(deposit[4]).to.equal(depositValue);
            expect(deposit[5]).to.equal(0);
            expect(deposit[6]).to.equal(block.timestamp);
            // expect(deposit[7]).to.equal(block.timestamp + productTerm);
        })
        it('should transfer tokens', async () => {
            await expect(async () =>         await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            }))
            .to.changeTokenBalance(bank, walletOne, depositValue);
        })
        
        it('should reduce balance', async () => {
            await expect(await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            }))
            .to.changeEtherBalance(walletOne, -depositValue);
        })
        
        it('should add logs', async () => {
            await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            
            const depositLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("LogDeposit(address,uint256,uint256)") ]
            })
            
            expect(depositLogs[0].topics[1].toLowerCase()).to.equals(utils.hexZeroPad(await walletOne.getAddress(), 32).toLowerCase());
            expect(utils.hexStripZeros(depositLogs[0].topics[2])).to.equals(utils.hexValue(1));
            // TODO: add value fron data checking
            // let depositData = ethers.utils.defaultAbiCoder.decode([ 'uint256' ], utils.hexDataSlice(depositLogs[0].data, 0));
            // expect(depositData).to.equal(depositValue);
            
            const transferLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("Transfer(address,address,uint256)") ]
            })
            
            expect(utils.hexStripZeros(transferLogs[0].topics[1]).toLowerCase()).to.equals('0x');
            expect(utils.hexStripZeros(transferLogs[0].topics[2]).toLowerCase()).to.equals((await walletOne.getAddress()).toLowerCase());
            // TODO: add value fron data checking
            //expect(depositData).to.equal(depositValue);
            
        });
         it('should add logs (renewal)', async () => {
            await bank.connect(walletOne).deposit(true, {value: depositValue});
            
            const depositLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("LogDeposit(address,uint256,uint256)") ]
            })
            
            expect(depositLogs[0].topics[1].toLowerCase()).to.equals(utils.hexZeroPad(await walletOne.getAddress(), 32).toLowerCase());
            expect(utils.hexStripZeros(depositLogs[0].topics[2])).to.equals(utils.hexValue(1));

            const renewalLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("LogAutoRenewal(uint256,bool)") ]
            })
            // console.log('=====================');
            // console.log(renewalLogs[0].data);
            expect(renewalLogs[0].topics[1].toLowerCase()).to.equals(utils.hexZeroPad(await bank.depositIndex(), 32).toLowerCase());
            expect(utils.hexStripZeros(renewalLogs[0].data)).to.equals(utils.hexValue(1));
            // TODO: add value fron data checking
            // let depositData = ethers.utils.defaultAbiCoder.decode([ 'uint256' ], utils.hexDataSlice(depositLogs[0].data, 0));
            // expect(depositData).to.equal(depositValue);
            
            const transferLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("Transfer(address,address,uint256)") ]
            })
            
            expect(utils.hexStripZeros(transferLogs[0].topics[1]).toLowerCase()).to.equals('0x');
            expect(utils.hexStripZeros(transferLogs[0].topics[2]).toLowerCase()).to.equals((await walletOne.getAddress()).toLowerCase());
            // TODO: add value fron data checking
            //expect(depositData).to.equal(depositValue);
            
        });
        
    })
    
    describe('withdrawal', async() => { 
        let otherBank: InstanceType<typeof ethers.Contract>;
        
        beforeEach(async () => {
            await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
        });
        
        //         const depositOwner = accounts[1];
        it('should allow withdrawal only by owner', async() => {
            await expect(bank.makeWithdrawal(1)).to.be.revertedWith("Owner missmatch.")
        });
        
        it('should withdrawal only existing deposits', async() => {
            await expect(bank.makeWithdrawal(100)).to.be.revertedWith("Deposit does not exist.");
        });
        
        it('should decrease deposit data', async() => {
            const prevQty = await bank.depositIndex();
            const prevVal = await bank.depositValue();
            
            await bank.connect(walletOne).makeWithdrawal(1);
            
            const depositQty = await bank.depositIndex();
            const depositVal = await bank.depositValue();
            expect(depositQty).to.equal(prevQty.sub(1));
            expect(depositVal).to.equal(prevVal.sub(depositValue));
        });
        
        it('should not withdrawal again', async () => {
            await bank.connect(walletOne).makeWithdrawal(1);
            await expect(bank.connect(walletOne).makeWithdrawal(0)).to.be.revertedWith("Deposit is closed.");
        });
        
        it('should reduce tokens', async () => {
            await expect(async () => bank.connect(walletOne).makeWithdrawal(1))
            .to.changeTokenBalance(bank, walletOne, -depositValue);
        })
        
        it('should increase balance', async () => {
            await expect(await bank.connect(walletOne).makeWithdrawal(1))
            .to.changeEtherBalances([bank, walletOne], [-depositValue, depositValue]);
        })
        
        it('should return money with fine before expire', async () => {
            const fine = 20; // 20%
            // otherBank = await deployContract(wallet, Bank, [productTerm, 0, fine, geg.address, constants.AddressZero]);
        otherBank = await Bank.deploy();
        await otherBank.initialize(bankName, bankSymbol, productTerm, interest, fine, geg.address, constants.AddressZero);
            await walletOne.sendTransaction({
                to: otherBank.address,
                value: depositValue
            });
            const depositWithFine = depositValue.div(100).mul(100 - fine);
            await expect(await otherBank.connect(walletOne).makeWithdrawal(1))
            .to.changeEtherBalances([otherBank, walletOne], [-depositWithFine, depositWithFine]);
        })
        
        it('should return money with no fine after expire', async () => {
            const fine = 20; // 20%
            const term = 86400 * 30;
            // let otherBank = await deployContract(wallet, Bank, [term, 0, fine, geg.address, constants.AddressZero]);
        let otherBank = await Bank.deploy();
        await otherBank.initialize(bankName, bankSymbol, term, interest, fine, geg.address, mockOracle.address);
        await geg.connect(wallet).approve(otherBank.address, utils.parseEther('1000.0'));
            await walletOne.sendTransaction({
                to: otherBank.address,
                value: depositValue
            });

            const deposit = await otherBank.deposits(await otherBank.depositIndex());
            
            const prevBalance = await provider.getBalance(walletOne.getAddress());
            
            provider.send("evm_increaseTime", [term + 1]);   // add 60 seconds
            provider.send("evm_mine", []);      // mine the next block


            await expect(await otherBank.connect(walletOne).makeWithdrawal(1))
            .to.changeEtherBalances([otherBank, walletOne], [-depositValue, depositValue]);
                        
            // bank.on("LogUint", (s, x) => {
                // console.log(`Event "${s.toString()}" (${x.toString()})`);
            // })
        })
        
        it('should add withdrawal log', async () => { 
            await bank.connect(walletOne).makeWithdrawal(1);
            
            const withdrawalLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("LogWithdrawal(address,uint256,uint256)") ]
            })
            
            expect(withdrawalLogs[0].topics[1].toLowerCase()).to.equals(utils.hexZeroPad(await walletOne.getAddress(), 32).toLowerCase());
            expect(utils.hexStripZeros(withdrawalLogs[0].topics[2])).to.equals(utils.hexValue(1));
            // TODO: add value fron data checking
            // let depositData = ethers.utils.defaultAbiCoder.decode([ 'uint256' ], utils.hexDataSlice(depositLogs[0].data, 0));
            // expect(depositData).to.equal(depositValue);
            
            const transferLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("Transfer(address,address,uint256)") ]
            })
            
            expect(utils.hexStripZeros(transferLogs[0].topics[2]).toLowerCase()).to.equals('0x');
            expect(utils.hexStripZeros(transferLogs[0].topics[1]).toLowerCase()).to.equals((await walletOne.getAddress()).toLowerCase());
            // TODO: add value fron data checking
            //expect(depositData).to.equal(depositValue);
        });
        
    })
    
    describe('donate', async () =>  {
        it('should increase balance', async () => {
            const recharge = depositValue.mul(7);
            const prevTokens = await bank.totalSupply();
            const prevBalance = await provider.getBalance(bank.address);
            
            const prevQty = await bank.depositIndex();
            const prevVal = await bank.depositValue();
            
            await bank.donate({value: recharge, gasLimit: "2000000"});
            expect(await bank.totalSupply()).to.equal(prevTokens);
            expect(await provider.getBalance(bank.address)).to.equal(prevBalance.add(recharge));
            
            const depositQty = await bank.depositIndex();
            const depositVal = await bank.depositValue();
            expect(depositQty).to.equal(prevQty);
            expect(depositVal).to.equal(prevVal);
        })
    })
    
    describe('claims', async() => {
        //         const depositOwner = accounts[1];
        beforeEach(async () => {
            await walletOne.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            await bank.withdraw(depositValue.div(2));
        })
        
        it('should start with no claims', async () => {
            expect(await bank.claimIndex()).to.equal(0);
        })
        
        it('should  emit claim log', async () => {
            await bank.connect(walletOne).makeWithdrawal(1);
            
            const claimLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("LogClaim(uint256,uint256)") ]
            })
            
            
            expect(utils.hexStripZeros(claimLogs[0].topics[1]).toLowerCase()).to.equal(utils.hexValue(1));
            // TODO: add value fron data checking
            // let depositData = ethers.utils.defaultAbiCoder.decode([ 'uint256' ], utils.hexDataSlice(depositLogs[0].data, 0));
            // expect(depositData).to.equal(depositValue);
            
        })
        
        it('should increase claim counters', async () => {
            const prevQty = await bank.claimIndex();
            const prevVal = await bank.claimValue();
            
            await bank.connect(walletOne).makeWithdrawal(1);
            
            const claimQty = await bank.claimIndex();
            const claimVal = await bank.claimValue();
            expect(claimQty).to.equal(prevQty.add(1));
            expect(claimVal).to.equal(prevVal.add(depositValue));
        })
        
        it('should prevent second claim', async () => {
            const prevQty = await bank.claimIndex();
            const prevVal = await bank.claimValue();
            
            await bank.connect(walletOne).makeWithdrawal(1);
            await expect(bank.connect(walletOne).makeWithdrawal(1)).to.be.revertedWith("Deposit is already claimed.");
            
            const claimQty = await bank.claimIndex();
            const claimVal = await bank.claimValue();
            expect(claimQty).to.equal(prevQty.add(1));
            expect(claimVal).to.equal(prevVal.add(depositValue));
        })
        
        
        it('should prevent any withdrawal if has claims', async () => {
            await walletTwo.sendTransaction({
                to: bank.address,
                value: depositValue
            });
            await bank.withdraw(depositValue);
            
            const prevBalance = await provider.getBalance(bank.address);
            
            await bank.connect(walletOne).makeWithdrawal(1);
            await bank.connect(walletTwo).makeWithdrawal(2); 
            
            const balance = await provider.getBalance(bank.address);
            expect(balance).to.equal(prevBalance);
        })
        
        //         //  it('should pay out claim (full)', async () => {
        //         //     // Not ehough money and claimMode ON
        //         //     const firstPrevBalance = await web3.eth.getBalance(depositOwner);
        //         //     let receipt = await bank.makeWithdrawal(1, {from: depositOwner});
        
        //         //     await bank.send(depositValue, {from: accounts[7], value: depositValue});
        //         //     await bank.withdraw(depositValue);
        //         //     //await expect(bank.makeWithdrawal(2, {from: accounts[7]})).to.be.rejectedWith("Claim mode.");
        //         //     await bank.makeWithdrawal(2, {from: accounts[7]});
        //         //     const secondPrevBalance = await web3.eth.getBalance(accounts[7]);
        
        //         //     await bank.send(depositValue, {from: accounts[8], value: depositValue});
        //         //     await bank.withdraw(depositValue);
        //         //     // await expect(bank.makeWithdrawal(3, {from: accounts[9]})).to.be.rejectedWith("Claim mode.");
        //         //     await bank.makeWithdrawal(3, {from: accounts[8]});
        //         //     const thirdPrevBalance = await web3.eth.getBalance(accounts[8]);
        
        //         //     await bank.send(depositValue, {from: accounts[9], value: depositValue});
        //         //     await bank.withdraw(depositValue);
        //         //     // await expect(bank.makeWithdrawal(4, {from: accounts[9]})).to.be.rejectedWith("Claim mode.");
        //         //     await bank.makeWithdrawal(4, {from: accounts[9]});
        //         //     const fourthPrevBalance = await web3.eth.getBalance(accounts[9]);
        
        //         //     const prevQty = await bank.claimIndex();
        //         //     const prevVal = await bank.claimValue();
        
        //         //     let rechargeRecepit = await bank.recharge({from: owner, value: depositValue.mul(web3.utils.toBN(6))});
        
        //         //     const claimQty = await bank.claimIndex();
        //         //     const claimVal = await bank.claimValue();
        //         //     expect(claimQty).to.eq.BN(prevQty.sub(web3.utils.toBN(4)));
        //         //     expect(claimVal).to.eq.BN(prevVal.sub(web3.utils.toBN(depositValue.mul(web3.utils.toBN(4)))));
        
        //         //     expect(await web3.eth.getBalance(depositOwner)).to.eq.BN(web3.utils.toBN(firstPrevBalance).add(depositValue).sub(await gasCost(receipt)));
        //         //     expect(await web3.eth.getBalance(accounts[7])).to.eq.BN(web3.utils.toBN(secondPrevBalance).add(depositValue));
        //         //     expect(await web3.eth.getBalance(accounts[8])).to.eq.BN(web3.utils.toBN(thirdPrevBalance).add(depositValue));
        //         //     expect(await web3.eth.getBalance(accounts[9])).to.eq.BN(web3.utils.toBN(fourthPrevBalance).add(depositValue));
        //         //  })
        
        //         //  it('should pay out claims (partitial)', async () => {
        //         //      // Not ehough money and claimMode ON
        //         //     const firstPrevBalance = await web3.eth.getBalance(depositOwner);
        //         //     let receipt = await bank.makeWithdrawal(1, {from: depositOwner});
        
        //         //     await bank.send(depositValue, {from: accounts[7], value: depositValue});
        //         //     await bank.withdraw(depositValue);
        //         //     //await expect(bank.makeWithdrawal(2, {from: accounts[7]})).to.be.rejectedWith("Claim mode.");
        //         //     await bank.makeWithdrawal(2, {from: accounts[7]});
        //         //     const secondPrevBalance = await web3.eth.getBalance(accounts[7]);
        
        //         //     await bank.send(depositValue, {from: accounts[8], value: depositValue});
        //         //     await bank.withdraw(depositValue);
        //         //     // await expect(bank.makeWithdrawal(3, {from: accounts[9]})).to.be.rejectedWith("Claim mode.");
        //         //     await bank.makeWithdrawal(3, {from: accounts[8]});
        //         //     const thirdPrevBalance = await web3.eth.getBalance(accounts[8]);
        
        //         //     await bank.send(depositValue, {from: accounts[9], value: depositValue});
        //         //     await bank.withdraw(depositValue);
        //         //     // await expect(bank.makeWithdrawal(4, {from: accounts[9]})).to.be.rejectedWith("Claim mode.");
        //         //     await bank.makeWithdrawal(4, {from: accounts[9]});
        //         //     const fourthPrevBalance = await web3.eth.getBalance(accounts[9]);
        
        //         //     const prevQty = await bank.claimIndex();
        //         //     const prevVal = await bank.claimValue();
        
        //         //     let rechargeRecepit = await bank.recharge({from: owner, value: depositValue.mul(web3.utils.toBN(2))});
        
        //         //     const claimQty = await bank.claimIndex();
        //         //     const claimVal = await bank.claimValue();
        //         //     expect(claimQty).to.eq.BN(prevQty.sub(web3.utils.toBN(2)));
        //         //     expect(claimVal).to.eq.BN(prevVal.sub(web3.utils.toBN(depositValue.mul(web3.utils.toBN(2)))));
        
        //         //     expect(await web3.eth.getBalance(depositOwner)).to.eq.BN(web3.utils.toBN(firstPrevBalance).add(depositValue).sub(await gasCost(receipt)));
        //         //     expect(await web3.eth.getBalance(accounts[7])).to.eq.BN(web3.utils.toBN(secondPrevBalance).add(depositValue));
        //         //     expect(await web3.eth.getBalance(accounts[8])).to.eq.BN(web3.utils.toBN(thirdPrevBalance));
        //         //     expect(await web3.eth.getBalance(accounts[9])).to.eq.BN(web3.utils.toBN(fourthPrevBalance));
        //         //  })
        
        it('should pay out claims after deposit', async () => {
            // Not ehough money and claimMode ON
            // await bank.connect(walletOne).makeWithdrawal(1);
            await expect( await bank.connect(walletOne).makeWithdrawal(1))
            .to.changeEtherBalances([bank, walletOne], [0, 0]);
            
            // 1 claim depositValue
            
            await expect( await walletTwo.sendTransaction({
                to: bank.address,
                value: depositValue,
                gasLimit: 2000000
            }))
            .to.changeEtherBalances([bank, walletOne], [0, depositValue]);
            
            // 0 claim 
            
            await bank.withdraw(await provider.getBalance(bank.address));
            await bank.connect(walletTwo).makeWithdrawal(2);
            
            // 1 claim 
            
            await expect( await walletThree.sendTransaction({
                to: bank.address,
                value: depositValue,
                gasLimit: 2000000
            }))
            .to.changeEtherBalances([bank, walletTwo], [0, depositValue]);
            
            // 0 claim 
            
            await bank.withdraw(await provider.getBalance(bank.address));
            await bank.connect(walletThree).makeWithdrawal(3);
            
            // 1 claim 

            await expect(await walletFour.sendTransaction({
                to: bank.address,
                value: depositValue,
                gasLimit: 2000000
            }))
            .to.changeEtherBalances([bank, walletThree], [0, depositValue]);
            
            // 0 claim 
            
            await bank.withdraw(await provider.getBalance(bank.address));
            await bank.connect(walletFour).makeWithdrawal(4);
            
            // 1 claim 
            
            const prevQty = await bank.claimIndex();
            const prevVal = await bank.claimValue();
            
            await expect(await wallet.sendTransaction({
                to: bank.address,
                value: depositValue.mul(3),
                gasLimit: 2000000
            }))
            .to.changeEtherBalances([bank, walletFour], [depositValue.mul(2), depositValue]);
            
            // 0 claim 
            
            const claimQty = await bank.claimIndex();
            const claimVal = await bank.claimValue();
            expect(claimQty).to.equal(prevQty.sub(1));
            expect(claimVal).to.equal(prevVal.sub(depositValue.mul(1)));
        })
        
    })
    
})



