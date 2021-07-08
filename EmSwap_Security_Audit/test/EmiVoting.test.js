// eslint-disable-next-line no-unused-vars
const { BN,
    constants,
    expectEvent,
    expectRevert,
    time,
    ether } = require('@openzeppelin/test-helpers');

  //const BigNumber = web3.BigNumber;
  
  const { assert } = require('chai');
  
  const should = require('chai')
    //.use(require('chai-bignumber')(BigNumber))
    .should();
  
  const { contract } = require('./twrapper');
  
  const EmiVoting = contract.fromArtifact('EmiVoting');
  const MockUSDX = contract.fromArtifact('MockUSDX');
  const Timelock = contract.fromArtifact('Timelock');
  
  let emiVote, usdx, timelock;
  
  describe('EmiVoting contract', () => {
    const initialOwner = accounts[0];
    const tokenPool = accounts[1];
    const userBob = accounts[2];
    const userAlice = accounts[3];
    let r = { logs:'' };
  
    beforeEach(async function () {
      this.usdx = await MockUSDX.new();
      this.usdx.transfer(userBob, ether('3000000'));
      this.timelock = await Timelock.new(initialOwner, 60*60*24*4);
      this.emiVote = await EmiVoting.new(this.timelock.address, this.usdx.address, initialOwner);
    });

    describe('From ground zero we', async function () {
      it('Can start new voting as admin', async function () {
          r = await this.emiVote.propose([this.timelock.address],[0],['Signature'],['0x1111'],'Test proposal', 40);
          expectEvent.inLogs(r.logs,'ProposalCreated');
      });
  
      it('Can view voting as generic user', async function () {
        r = await this.emiVote.propose([this.timelock.address],[0],['Signature'],['0x1111'],'Test proposal', 40);
        expectEvent.inLogs(r.logs,'ProposalCreated');
        let pid = r.logs[0].args.id;
        assert.equal(pid, 1);

        let b = await this.emiVote.state(pid);
        console.log('State: %d',b);
        assert.equal(b, 0);
      });

      it('Can get voting result after time passes', async function () {
        let blkNum = parseInt(await time.latestBlock());
        r = await this.emiVote.propose([this.timelock.address],[0],['Signature'],['0x1111'],'Test proposal', 20);
        expectEvent.inLogs(r.logs,'ProposalCreated');
        let pid = r.logs[0].args.id;
        console.log('Block proposed 1: %d', blkNum);

	await time.advanceBlockTo(blkNum + 8); // skip some blocks
        await this.emiVote.castVote(pid, true, {from: userBob});
        await time.advanceBlockTo(blkNum + 12);
        let b = await this.emiVote.state(pid);
        console.log('State: %s', b);
        assert.equal(b, 1);
        await time.advanceBlockTo(blkNum + 30);
        b = await this.emiVote.state(pid);
        console.log('State: %s', b);
        assert.equal(b, 4);
      });
  
      it('Can get voting results', async function () {
        let blkNum = parseInt(await time.latestBlock());
        r = await this.emiVote.propose([this.timelock.address],[0],['Signature'],['0x1111'],'Test proposal 2', 20);
        expectEvent.inLogs(r.logs,'ProposalCreated');
        let pid = r.logs[0].args.id;
        console.log('Block proposed 2: %d', blkNum);

	await time.advanceBlockTo(blkNum + 20); // skip some blocks
        await this.emiVote.castVote(pid, true, {from: userBob});
        await time.advanceBlockTo(blkNum + 50);
        let b = await this.emiVote.getVotingResult(pid);
        console.log(b);
        assert.equal(b, this.timelock.address);
      });
    });
  });