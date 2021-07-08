const { expect } = require("chai");

const {
    BN,           // Big Number support
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
    time,
    constants
} = require('@openzeppelin/test-helpers');


describe('Sorted Linked list test', function () {
    beforeEach(async function() {
        const ll = await ethers.getContractFactory("SortedLinkedList");

        this.ll = await ll.deploy();

        console.log(this.ll.address);
    })

    /*it('should revert since user has not approve any deposit to contract', async function () {
        await expectRevert(
            this.fourRXFinance.deposit(1000, constants.ZERO_ADDRESS, 0),
            'ERC20: transfer amount exceeds balance.'
        );
    });*/

    it('test', async function () {
        const [user1, user2, user3, user4, user5, user6, user7, user8, user9] = await ethers.getSigners();

        console.log('0');
        await this.ll.addStudent(user1.address, 13, '0x0000000000000000000000000000000000000001');
        console.log('1');
        await this.ll.addStudent(user2.address, 16, '0x0000000000000000000000000000000000000001');
        console.log('2');
        await this.ll.addStudent(user3.address, 12, user1.address);
        console.log('3');
        await this.ll.addStudent(user4.address, 11, user3.address);
        console.log('4');
        await this.ll.addStudent(user5.address, 20, '0x0000000000000000000000000000000000000001');
        console.log('5');
        await this.ll.addStudent(user6.address, 18, user5.address);
        await this.ll.addStudent(user7.address, 43, '0x0000000000000000000000000000000000000001');
        await this.ll.addStudent(user8.address, 9, user4.address);
        await this.ll.addStudent(user9.address, 21, user7.address);
        console.log('9');
    });
});
