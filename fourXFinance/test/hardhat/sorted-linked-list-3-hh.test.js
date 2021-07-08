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
        const ll = await ethers.getContractFactory("SortedLinkedListArray");

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
        await this.ll.addItem(user1.address, 13, 1, 0);
        // console.log('1');
        await this.ll.addItem(user2.address, 16, 2,  0);
        // console.log('2');
        await this.ll.addItem(user3.address, 12, 3,  1);
        // console.log('3');
        await this.ll.addItem(user4.address, 11, 0, 3);
        // console.log('4');
        await this.ll.addItem(user5.address, 20, 1, 0);
        // console.log('5');
        await this.ll.addItem(user6.address, 18, 0, 5);
        await this.ll.addItem(user7.address, 43, 1,  0);
        await this.ll.addItem(user8.address, 9, 0,  4);
        await this.ll.addItem(user9.address, 21, 0, 7);
        // console.log('9');

        await this.ll.updateItem(user9.address, 10, 0, 9, 7, 4);

        const list = await this.ll.getTopKItems(8);

        for (let i = 0; i < list.length; i++) {
            console.log(list[i].toString());
        }

        await this.ll.deleteList();
    });
});
