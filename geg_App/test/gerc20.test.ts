import {expect} from 'chai';
import { waffle, ethers } from "hardhat";
import {Contract, ContractFactory, utils, constants} from 'ethers';

const provider = waffle.provider;
const bankName = "GEG ERC20";
const bankSymbol = "gERC20";

const Oracle = require('../build/contracts/OracleV1.sol/OracleV1.json');


describe('Bank::gERC20::v1', () => {
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

   describe('owner only', async () => {
    beforeEach(async () => {
        Bank = await ethers.getContractFactory("GErc20");
        GEG = await ethers.getContractFactory("GEG");
        geg = await GEG.connect(wallet).deploy(utils.parseEther('10000000.0'));
        bank = await Bank.connect(wallet).deploy();
        await bank.connect(wallet).initialize(bankName, bankSymbol, productTerm, interest, 0, geg.address, constants.AddressZero, geg.address);
        // await bank.connect(wallet).setUnderlying(geg.address);
        await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletTwo.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletThree.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletFour.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(walletOne).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletTwo).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletThree).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletFour).approve(bank.address, utils.parseEther('1000.0'));
        await wallet.sendTransaction({
            to: bank.address,
            value: depositValue
        });
    })
         it('should have owner', async () => {
            const owner_ = await bank.owner();
            
            expect(await wallet.getAddress()).to.equal(owner_);
        });
        
        it('should withdraw money to owner', async () => {
            await bank.connect(walletOne).deposit(depositValue, true);
            
            await expect(async () => await bank.withdraw(depositValue))
            .to.changeTokenBalance(geg, wallet, depositValue);
        })
        
        it('should not allow withdraw by non-admin', async () => {
            await bank.connect(walletOne).deposit(depositValue, true);
            // await walletOne.sendTransaction({
                // to: bank.address,
                // value: depositValue
            // });
            
            await expect( bank.connect(walletOne).withdraw(depositValue)).to.be.revertedWith("Ownable: caller is not the owner");
            await expect( bank.connect(walletTwo).withdraw(depositValue)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    })
 
    describe('deposits', async () => {
    beforeEach(async () => {
        Bank = await ethers.getContractFactory("GErc20");
        GEG = await ethers.getContractFactory("GEG");
        geg = await GEG.connect(wallet).deploy(utils.parseEther('10000000.0'));
        bank = await Bank.connect(wallet).deploy();
        await bank.connect(wallet).initialize(bankName, bankSymbol, productTerm, interest, 0, geg.address, constants.AddressZero, geg.address);
        // await bank.connect(wallet).setUnderlying(geg.address);
        await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletTwo.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletThree.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletFour.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(walletOne).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletTwo).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletThree).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletFour).approve(bank.address, utils.parseEther('1000.0'));
        await wallet.sendTransaction({
            to: bank.address,
            value: depositValue
        });
    })
         it('should start with 0 deposit', async () => {
            expect(await bank.depositIndex()).to.equal(0);
            expect(await bank.depositValue()).to.equal(0);
        })
        it('should add deposit', async() => {
            const prevQty = await bank.depositIndex();
            const prevVal = await bank.depositValue();


            await bank.connect(walletOne).deposit(depositValue, true);
            // console.log(`walletOne: ${await walletOne.getAddress()}`)    
            // bank.on("LogAddress", (s, x) => {
                // console.log(`Event "${s.toString()}" (${x.toString()})`);
            // })
            // bank.on("LogUint", (s, x) => {
                // console.log(`Event "${s.toString()}" (${x.toString()})`);
            // })
            expect(await bank.depositIndex()).to.equal(prevQty.add(1));
            expect(await bank.depositValue()).to.equal(prevVal.add(depositValue));
            
        })
        
        it('should store deposit info', async () => {
            let receipt = await bank.connect(walletOne).deposit(depositValue, false);
            // let receipt = await walletOne.sendTransaction({
                // to: bank.address,
                // value: depositValue
            // });
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
            let receipt = await bank.connect(walletOne).deposit(depositValue, true);
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
            await expect(async () =>         await bank.connect(walletOne).deposit(depositValue, true)
            )
            .to.changeTokenBalance(bank, walletOne, depositValue);
        })
        
        it('should reduce balance', async () => {
            await expect(async () => await bank.connect(walletOne).deposit(depositValue, true))
            .to.changeTokenBalance(geg, walletOne, -depositValue);
        })
        
        it('should add logs', async () => {
            await bank.connect(walletOne).deposit(depositValue, true);
            
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
            await bank.connect(walletOne).deposit(depositValue, true);
            
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

            const renewalLogs = await provider.getLogs({
                fromBlock: process.env.DEPLOYMENT_BLOCK,
                toBlock: 'latest',
                address: bank.address,
                topics: [ utils.id("LogAutoRenewal(uint256,bool)") ]
            })
            
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
        Bank = await ethers.getContractFactory("GErc20");
        GEG = await ethers.getContractFactory("GEG");
        geg = await GEG.connect(wallet).deploy(utils.parseEther('10000000.0'));
        bank = await Bank.connect(wallet).deploy();
        await bank.connect(wallet).initialize(bankName, bankSymbol, productTerm, interest, 0, geg.address, constants.AddressZero, geg.address);
        // await bank.connect(wallet).setUnderlying(geg.address);
        await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletTwo.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletThree.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletFour.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(walletOne).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletTwo).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletThree).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletFour).approve(bank.address, utils.parseEther('1000.0'));
        await wallet.sendTransaction({
            to: bank.address,
            value: depositValue
        });
         
            await bank.connect(walletOne).deposit(depositValue, true);
            await bank.connect(walletOne).deposit(depositValue, true);
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
            
//              bank.on("LogUint", (s, x) => {
//                  console.log(`Event "${s.toString()}" (${x.toString()})`);
//             })
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
            await expect(async () => await bank.connect(walletOne).makeWithdrawal(1))
            .to.changeTokenBalance(geg, walletOne, depositValue);
        })
        
        it('should return money with fine before expire', async () => {
            const fine = 20; // 20%
            // otherBank = await deployContract(wallet, Bank, [productTerm, 0, fine, geg.address, constants.AddressZero]);
            let otherBank = await Bank.deploy();
            await otherBank.initialize(bankName, bankSymbol, productTerm, interest, fine, geg.address, constants.AddressZero, geg.address);
            // await otherBank.connect(wallet).setUnderlying(geg.address);
            await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
            await geg.connect(walletOne).approve(otherBank.address, utils.parseEther('1000.0'));
            await otherBank.connect(walletOne).deposit(depositValue, true);
            const depositWithFine = depositValue.div(100).mul(100 - fine);
            await expect( async() => await otherBank.connect(walletOne).makeWithdrawal(1))
            .to.changeTokenBalance(geg, walletOne, depositWithFine);
        })
        
        it('should return money with no fine after expire', async () => {
            const fine = 20; // 20%
            const term = 86400 * 30;
            // // let otherBank = await deployContract(wallet, Bank, [term, 0, fine, geg.address, constants.AddressZero]);
            let otherBank = await Bank.deploy();
            // await otherBank.initialize(term, 0, fine, geg.address, constants.AddressZero);
            // await otherBank.connect(wallet).setUnderlying(geg.address);
            // await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
            // await geg.connect(walletOne).approve(otherBank.address, utils.parseEther('1000.0'));
            // await otherBank.connect(walletOne).deposit(depositValue);
            
            // provider.send("evm_increaseTime", [term + 1]);   // add 60 seconds
            // provider.send("evm_mine", []);      // mine the next block
            
            // await expect(async() =>  await otherBank.connect(walletOne).makeWithdrawal(1))
            // .to.changeTokenBalance(geg, walletOne, depositValue);
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
    beforeEach(async () => {
        Bank = await ethers.getContractFactory("GErc20");
        GEG = await ethers.getContractFactory("GEG");
        geg = await GEG.connect(wallet).deploy(utils.parseEther('10000000.0'));
        bank = await Bank.connect(wallet).deploy();
        await bank.connect(wallet).initialize(bankName, bankSymbol, productTerm, interest, 0, geg.address, constants.AddressZero, geg.address);
        // await bank.connect(wallet).setUnderlying(geg.address);
        await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletTwo.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletThree.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletFour.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(walletOne).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletTwo).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletThree).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletFour).approve(bank.address, utils.parseEther('1000.0'));
        await wallet.sendTransaction({
            to: bank.address,
            value: depositValue
        });
    })
         it('should increase balance', async () => {
            const recharge = depositValue.mul(7);
            const prevTokens = await bank.totalSupply();
            const prevBalance = await provider.getBalance(bank.address);
            
            const prevQty = await bank.depositIndex();
            const prevVal = await bank.depositValue();
            
            await geg.connect(wallet).approve(bank.address, utils.parseEther('1000.0'));
            await expect(async() =>  await bank.connect(wallet).donate(recharge))
            .to.changeTokenBalance(geg, bank, recharge);
            
            const depositQty = await bank.depositIndex();
            const depositVal = await bank.depositValue();
            expect(depositQty).to.equal(prevQty);
            expect(depositVal).to.equal(prevVal);
        })
    })
     describe('claims', async() => {
    beforeEach(async () => {
        Bank = await ethers.getContractFactory("GErc20");
        GEG = await ethers.getContractFactory("GEG");
        geg = await GEG.connect(wallet).deploy(utils.parseEther('10000000.0'));
        bank = await Bank.connect(wallet).deploy();
        await bank.connect(wallet).initialize(bankName, bankSymbol, productTerm, interest, 0, geg.address, constants.AddressZero, geg.address);
        // await bank.connect(wallet).setUnderlying(geg.address);
        await geg.connect(wallet).transfer(walletOne.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletTwo.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletThree.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).transfer(walletFour.getAddress(), utils.parseEther('1000.0'));
        await geg.connect(wallet).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletOne).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletTwo).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletThree).approve(bank.address, utils.parseEther('1000.0'));
        await geg.connect(walletFour).approve(bank.address, utils.parseEther('1000.0'));
        await wallet.sendTransaction({
            to: bank.address,
            value: depositValue
        });
            await bank.connect(walletOne).deposit(depositValue, true);
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
            await bank.connect(walletTwo).deposit(depositValue, true);
            await bank.withdraw(depositValue);
            
            const prevBalance = await provider.getBalance(bank.address);
            
            await bank.connect(walletOne).makeWithdrawal(1);
            await bank.connect(walletTwo).makeWithdrawal(2); 
            
            const balance = await provider.getBalance(bank.address);
            expect(balance).to.equal(prevBalance);
        })
        
        it('should pay out claims after deposit', async () => {
            // Not ehough money and claimMode ON
            // await bank.connect(walletOne).makeWithdrawal(1);
            await expect(async () =>  await bank.connect(walletOne).makeWithdrawal(1))
            .to.changeTokenBalance(geg, walletOne, 0);
            
            // 1 claim depositValue
            
            await expect(async() => await bank.connect(walletTwo).deposit(depositValue, {gasLimit: 4000000}))
            .to.changeTokenBalance(geg, walletOne, depositValue);

            // 0 claim 
            
            await bank.withdraw(await provider.getBalance(bank.address));
            await bank.connect(walletTwo).makeWithdrawal(2);
            
            // // 1 claim 
            
            await expect(async() => await bank.connect(walletThree).deposit(depositValue, {gasLimit: 4000000}))
            .to.changeTokenBalance(geg, walletTwo, depositValue);
            
            // 0 claim 
            
            await bank.withdraw(await provider.getBalance(bank.address));
            await bank.connect(walletThree).makeWithdrawal(3);
            
            // 1 claim 

            await expect(async() => await bank.connect(walletFour).deposit(depositValue, {gasLimit: 4000000}))
            .to.changeTokenBalance(geg, walletThree, depositValue);
            
            // 0 claim 
            
            await bank.withdraw(await provider.getBalance(bank.address));
            await bank.connect(walletFour).makeWithdrawal(4);
            
            // 1 claim 
            
            const prevQty = await bank.claimIndex();
            const prevVal = await bank.claimValue();
            
            await expect(async() => await bank.connect(wallet).deposit(depositValue.mul(3), {gasLimit: 4000000}))
            .to.changeTokenBalance(geg, walletFour, depositValue);
            
            // 0 claim 
            
            const claimQty = await bank.claimIndex();
            const claimVal = await bank.claimValue();
            expect(claimQty).to.equal(prevQty.sub(1));
            expect(claimVal).to.equal(prevVal.sub(depositValue.mul(1)));
        })
        
    })
 
})