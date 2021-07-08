const { accounts, contract } = require('@openzeppelin/test-environment');
const {
    time,
    constants,
    BN,
    expectEvent,
    expectRevert
} = require('@openzeppelin/test-helpers');

const { expect } = require('chai');
const [ owner, user1, user2 ] = accounts;

const FourRXFinance = contract.fromArtifact('FourRXFinance');
const ERC20 = contract.fromArtifact('FRX');

describe('FourRXFinance Insurance Tests', function () {
    beforeEach(async function() {
        this.timeout(50000);
        this.amount = 10000;
        this.erc20 = await ERC20.new({ from: owner });
        this.fourRXFinance = await FourRXFinance.new(this.erc20.address, 8, { from: owner });
        await this.erc20.transfer(user1, 1000000, { from: owner });
        await this.erc20.transfer(user2, 1000000, { from: owner });
        await this.erc20.approve(this.fourRXFinance.address, this.amount + 10000, {from: user1});
        await this.erc20.approve(this.fourRXFinance.address, this.amount + 10000, {from: user2});
        await this.fourRXFinance.deposit(this.amount, constants.ZERO_ADDRESS, 0, {from: user1});

    })

    it('should allow trigger the insurance state', async function () {
        this.timeout(50000);
        await time.increase(time.duration.days(10));
        await this.fourRXFinance.deposit(this.amount, user1, 0, {from: user2});
        await this.fourRXFinance.insureStake(0, {from: user2});

        while (!(await this.fourRXFinance.getContractInfo())[1]) {
            await time.increase(time.duration.days(5));
            await this.fourRXFinance.withdraw(0, {from: user1});
            if (!(await this.fourRXFinance.getContractInfo())[1]) {
                await this.fourRXFinance.withdraw(0, {from: user2});
            }
        }

        await time.increase(time.duration.days(5));

        expect((await this.fourRXFinance.getContractInfo())[1]).to.be.equals(true);
        await expectRevert.unspecified(this.fourRXFinance.withdraw(0, {from: user1}));

        await this.fourRXFinance.withdraw(0, {from: user2});
    });

    it('should allow user to insure his stake', async function () {
        await time.increase(time.duration.days(10));
        await this.fourRXFinance.insureStake(0, {from: user1});

        expect((await this.fourRXFinance.getUser(user1))['stakes'][0]['optInInsured']).to.be.equals(true);
    });
});
