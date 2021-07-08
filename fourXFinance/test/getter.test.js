const { accounts, contract } = require('@openzeppelin/test-environment');
const {
    time,
    constants,
    BN
} = require('@openzeppelin/test-helpers');

const { expect } = require('chai');
const [ owner, user1, user2 ] = accounts;

const FourRXFinance = contract.fromArtifact('FourRXFinance');
const ERC20 = contract.fromArtifact('FRX');

describe('FourRXFinance Getter Test', function () {
    beforeEach(async function() {
        this.amount = 10000;
        this.erc20 = await ERC20.new({ from: owner });
        this.fourRXFinance = await FourRXFinance.new(this.erc20.address, 8, { from: owner });
        await this.erc20.transfer(user1, 1000000, { from: owner });
        await this.erc20.transfer(user2, 1000000, { from: owner });
        await this.erc20.approve(this.fourRXFinance.address, this.amount, {from: user1});
        await this.erc20.approve(this.fourRXFinance.address, this.amount, {from: user2});
        await this.fourRXFinance.deposit(this.amount, constants.ZERO_ADDRESS, 0, {from: user1});
    })


    it('should success since it is just a getter', async function () {
        await time.increase(time.duration.days(10));
        await this.fourRXFinance.deposit(this.amount, user1, 0, {from: user2});

        expect((await this.fourRXFinance.getUser(user1))['wallet']).to.be.equals(user1);

    });

    it('should success since it is just a getter 2', async function () {
        await time.increase(time.duration.days(10));
        await this.fourRXFinance.deposit(this.amount, user1, 0, {from: user2});

        expect((await this.fourRXFinance.getPoolInfo())[3]).to.be.bignumber.equals(new BN(50));
    });

    it('should success since it is just a getter 3', async function () {
        await time.increase(time.duration.days(10));
        await this.fourRXFinance.deposit(this.amount, user1, 0, {from: user2});

        expect((await this.fourRXFinance.getContractInfo())[1]).to.be.equals(false);
    });
});
