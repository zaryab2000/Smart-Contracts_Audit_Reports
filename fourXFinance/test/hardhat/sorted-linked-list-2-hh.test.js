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
        const ll = await ethers.getContractFactory("CustomSortedLinkedList");

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

        // console.log('0');
        await this.ll.addItem(user1.address, 13, constants.ZERO_ADDRESS);
        // console.log('1');
        await this.ll.addItem(user2.address, 16, constants.ZERO_ADDRESS);
        // console.log('2');
        await this.ll.addItem(user3.address, 12, user1.address);
        // console.log('3');
        await this.ll.addItem(user4.address, 11, user3.address);
        // console.log('4');
        await this.ll.addItem(user5.address, 20, constants.ZERO_ADDRESS);
        // console.log('5');
        await this.ll.addItem(user6.address, 18, user5.address);
        await this.ll.addItem(user7.address, 43, constants.ZERO_ADDRESS);
        await this.ll.addItem(user8.address, 9, user4.address);
        await this.ll.addItem(user9.address, 21, user7.address);
        // console.log('9');

        await this.ll.updateItem(user9.address, 10, user7.address, user4.address);

        const list = await this.ll.getList(15);

        for (let i = 0; i < list.length; i++) {
            console.log(list[i].toString());
        }

        await this.ll.deleteMapping();
    });
});
