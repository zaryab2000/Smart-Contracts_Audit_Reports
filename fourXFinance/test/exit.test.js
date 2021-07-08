const { accounts, contract } = require('@openzeppelin/test-environment');
const {
    time,
    constants,
    BN,
    expectEvent
} = require('@openzeppelin/test-helpers');

const { expect } = require('chai');
const [ owner, user1, user2 ] = accounts;

const FourRXFinance = contract.fromArtifact('FourRXFinance');
const ERC20 = contract.fromArtifact('FRX');

describe('FourRXFinance Exit Tests', function () {
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


    it('should allow user to exit with 50% penalty', async function () {
        await time.increase(time.duration.days(10));
        const receipt = await this.fourRXFinance.exitProgram(0, {from: user1});

        expectEvent(receipt, 'Exited', {
            user: user1
        });

        expect((await this.fourRXFinance.getUser(user1))['stakes'][0]['penalty']).to.be.bignumber.equals(new BN(4750));

        expect(await this.erc20.balanceOf(user1)).to.be.bignumber.equals(new BN(994750));
    });
});
