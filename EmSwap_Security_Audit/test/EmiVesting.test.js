// eslint-disable-next-line no-unused-vars
const { BN,
    constants,
    expectEvent,
    expectRevert,
    time,
    ether } = require('@openzeppelin/test-helpers');  
  
  const { assert, expect } = require('chai');
  
  
  const { contract } = require('./twrapper');
  
  const EmiVesting = contract.fromArtifact('EmiVesting');
  const ESW = contract.fromArtifact('ESW');
  const moment = require('moment');  
  const should = require('chai')
    //.use(require('chai-bignumber')(BigNumber))
    //.use(require('chai-bignumber')(BN))
    .should();
   
  ESW.numberFormat = 'String';
  
  let emiVest, usdy;
  
  describe.skip('EmiVesting contract', () => {
    const initialOwner = accounts[0];
    const tokenPool = accounts[1];
    const userBob = accounts[2];
    const userAlice = accounts[3];
    let r = { logs:'' };
  
    beforeEach(async function () {
      this.usdy = await ESW.new({from: initialOwner});
      this.emiVest = await EmiVesting.new();
      await this.usdy.initialize({from: initialOwner});
      await this.emiVest.initialize(this.usdy.address);
      await this.usdy.setVesting(this.emiVest.address, {from: initialOwner});
      // Mint 1000000 ESW tokens to factoryOwner wallet
      await this.usdy.setMintLimit(initialOwner, 1000000000, {from: initialOwner});
      await this.usdy.setMintLimit(this.emiVest.address, 1000000000, {from: initialOwner});
      await this.usdy.mintClaimed(defaultSender, 1000000, {from: initialOwner}) 
    });
  
    describe('As a generic user we', async function () {  
      it('Cannot freeze tokens by ourself', async function () {
        await this.usdy.transfer(userBob, 5000);
        let b = await this.usdy.balanceOf(userBob);
        assert.equal(b, 5000);
        expectRevert.unspecified(this.emiVest.methods['freeze(address,uint256,uint256)'](userBob, 5000, 1, {from: userBob}));
      });
  
      it('Can get simple frozen token balance', async function () {
        await this.usdy.transfer(this.emiVest.address, 9000);
        let tx = await this.emiVest.freeze(userBob, 9000, 1); // freeze 9000
        expectEvent.inLogs(tx.logs,'TokensLocked');
        console.log("Gas used for freeze: %d", tx.receipt.gasUsed);
        let b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 9000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        assert.equal(b, 0);
        b = await this.emiVest.currentCrowdsaleLimit();
        assert.equal(b.toString(10), '39999999999999999999991000');
      });
  
      it('Can freeze tokens in bulk', async function () {
        await this.usdy.transfer(this.emiVest.address, 19000);
        let d1 = new Date('2020-10-17T09:33');
        let d2 = new Date('2020-10-22T17:01');
        let d = new Date();
        let tx = await this.emiVest.freezeBulk([userBob, userAlice], [Math.floor(d1.getTime()/1000), Math.floor(d2.getTime()/1000)], [3000, 16000], 1); // freeze 9000
        expectEvent.inLogs(tx.logs, 'TokensLocked');
        let b = await this.emiVest.getMyLock(0, {from:userBob});
        d.setTime(b[0]*1000);
        console.log("Bobs lock: " + d.toString() + ", amount: " + b[1] + ", category: " + b[2]);
        assert.equal(b[2], 1);
        assert.equal(b[1], 3000);
        b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 3000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        assert.equal(b, 0);
        b = await this.emiVest.getNextUnlock({from: userBob});
        d.setTime(b[0]*1000);
        console.log('Bobs next unlock is on ' + d.toString() + ', amount ' + b[1]);
        assert.equal(b[1], 750);
        b = await this.emiVest.balanceOf(userAlice);
        assert.equal(b, 16000);
        b = await this.emiVest.unlockedBalanceOf(userAlice);
        assert.equal(b, 0);
        b = await this.emiVest.getNextUnlock({from: userAlice});
        d.setTime(b[0]*1000);
        console.log('Alice next unlock is on ' + d.toString() + ', amount ' + b[1]);
        assert.equal(b[1], 4000);
        b = await this.emiVest.currentCrowdsaleLimit();
        assert.equal(b.toString(10), '40000000000000000000000000');
      });
  
      it('Can get frozen balances with several consecutive locks', async function () {
        await this.usdy.transfer(this.emiVest.address, 8000);
        await this.emiVest.freeze(userBob, 8000, 2); // freeze 8000 quarterly
  
        let releaseTime = (await time.latest()).add(time.duration.days(92));
        await time.increaseTo(releaseTime);
        let b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 8000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        assert.equal(b, 2000);
        await time.increaseTo(releaseTime.add(time.duration.days(92)));
        b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 8000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        assert.equal(b, 4000);
      });
  
      it('Can get frozen virtual balances', async function () {
        let s1 = await this.emiVest.getMyStats(2, {from: userBob});
        console.log("Bobs stats before freeze: acquired %d, minted %d, available to mint: %d",s1[0],s1[1],s1[2]);
  
        await this.usdy.transfer(this.emiVest.address, 6500);
        await this.emiVest.freezeVirtual(userBob, 6500, 2); // freeze 6500 quarterly
        await this.usdy.transfer(this.emiVest.address, 2500);
        await this.emiVest.freezeVirtual(userBob, 2500, 2); // freeze 2500 quarterly
        // get stats
        let s2 = await this.emiVest.getMyStats(2, {from: userBob});
        console.log("Bobs stats after freeze: acquired %d, minted %d, available to mint: %d",s2[0],s2[1],s2[2]);
        assert.equal(s1[2], 0); // nothing was available to mint
        assert.equal(s1[1] + s2[1], 0); // nothing minted actually
        assert.equal(s2[0] - s1[0], 9000); // but all acquired
        assert.equal(s1[2] + s2[2], 9000); // and all available to mint
        let b = await this.emiVest.currentCrowdsaleLimit();
        assert.equal(b.toString(10), '40000000000000000000000000');
  
        // should have virtual balance
        b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 9000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        assert.equal(b, 0);
        b = await this.emiVest.balanceOfVirtual(userBob);
        assert.equal(b, 9000);
        let cnt = await this.emiVest.getMyLocksLen({from: userBob});
        assert.equal(cnt, 1);
  
        let t = await time.latest();
        console.log('Current BC time is ' + Date(t).toString());
        console.log('Bob has ' + cnt + ' locks of ' + b + ' tokens in total');
  
        for (let i = 0; i < cnt; i++) {
          b = await this.emiVest.getMyLock(i, {from: userBob});
          t = new Date(b[0] * 1000);
          console.log('Bob has lock #' + i + ' from: ' + t.toString() + ', amount: ' + b[1]);
        }
      });
  
      it('Can claim partially unlocked tokens', async function () {
        await this.usdy.transfer(this.emiVest.address, 8000);
        await this.emiVest.freeze(userBob, 8000, 2); // freeze 8000 for 2 years quarterly
        await this.usdy.transfer(this.emiVest.address, 11000);
        let t = moment().subtract(19, 'days');
        await this.emiVest.freezePresale(userBob, Math.floor(t/1000), 10000, 1); // freeze 10000 for 2 years quarterly
  
        t = moment().subtract(85, 'days');
        await this.emiVest.freezePresale(userBob, Math.floor(t/1000), 1000, 1); // freeze 1000 for 2 years quarterly
  
        let releaseTime = (await time.latest()).add(time.duration.days(90));
        await time.increaseTo(releaseTime);
        let b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 19000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        console.log("Unlocked balance before claim, after 1 period: " + b.toString());
        assert.equal(b, 10250);
        r = await this.emiVest.claim({from: userBob});
        expectEvent.inLogs(r.logs,'TokensClaimed');
        console.log('Claim gas used: ', r.receipt.gasUsed);
        let c = await this.usdy.balanceOf(userBob);
        assert.equal(c, 10250);
        b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 8750);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        console.log("Unlocked balance after claim: " + b.toString());
        assert.equal(b, 0);
        releaseTime = (await time.latest()).add(time.duration.days(92));
        await time.increaseTo(releaseTime);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        console.log("Unlocked balance after claim, after 2nd period: " + b.toString());
        assert.equal(b, 4750);
      });

      it('Can mint virtual tokens', async function () {
        await this.usdy.transfer(this.emiVest.address, 8000);
        await this.emiVest.freeze(userBob, 8000, 2); // freeze 8000 for 2 years quarterly
        await this.usdy.transfer(this.emiVest.address, 11000);
        let t = moment().subtract(19, 'days');
        await this.emiVest.freezeVirtualWithCrowdsale(userBob, Math.floor(t/1000), 10000, 1); // freeze 10000 for 2 years quarterly
  
        t = moment().subtract(85, 'days');
        await this.emiVest.freezeVirtualWithCrowdsale(userBob, Math.floor(t/1000), 1000, 2); // freeze 1000 for 2 years quarterly
  
        let b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 19000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        assert.equal(b, 11000);
        b = await this.emiVest.balanceOfVirtual(userBob);
        console.log("Virtual balance before mint: " + b.toString());
        assert.equal(b, 11000);
        r = await this.emiVest.mint({from: userBob});
        console.log('Mint gas used: ', r.receipt.gasUsed);
        let c = await this.usdy.balanceOf(userBob);
        assert.equal(c, 0);
        b = await this.emiVest.balanceOfVirtual(userBob);
        assert.equal(b, 0);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        console.log("Unlocked balance after mint: " + b.toString());
        assert.equal(b, 11000);

        r = await this.emiVest.claim({from: userBob});
        expectEvent.inLogs(r.logs,'TokensClaimed');
        console.log('Claim gas used: ', r.receipt.gasUsed);
        c = await this.usdy.balanceOf(userBob);
        assert.equal(c, 11000);
        b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 8000);
        b = await this.emiVest.unlockedBalanceOf(userBob);
        console.log("Unlocked balance after claim: " + b.toString());
        assert.equal(b, 0);

      });  
      it('Can view own locks', async function () {
        await this.usdy.transfer(this.emiVest.address, 8000);
        await this.emiVest.freeze(userBob, 8000, 1); // freeze 8000 for cat 1
        await this.emiVest.freeze(userBob, 22000, 2); // freeze 22000 for cat 2
        await this.emiVest.freeze(userBob, 4200, 1); // freeze 8000 for cat 1
  
        let b = await this.emiVest.balanceOf(userBob);
        assert.equal(b, 34200);
  
        let cnt = await this.emiVest.getMyLocksLen({from: userBob});
        assert.equal(cnt, 2);
  
        console.log('Bob has ' + cnt + ' locks of ' + b + ' tokens in total');
  
        for (let i = 0; i < cnt; i++) {
          b = await this.emiVest.getMyLock(i, {from: userBob});
          t = new Date(b[0] * 1000);
          console.log('Bob has lock #' + i + ' from: ' + t.toString() + ', amount: ' + b[1]);
        }
      });
  
      it('Can view own stats', async function () {
        await this.usdy.transfer(this.emiVest.address, 40000);
        await this.emiVest.freeze(userBob, 8000, 1); // freeze 8000
        await this.emiVest.freeze(userBob, 22000, 2); // freeze 22000
        await this.emiVest.freeze(userBob, 4000, 1); // freeze 8000
        await this.emiVest.freeze(userBob, 6000, 2); // freeze 22000
  
        let b = await this.emiVest.getMyStats(1, {from: userBob});
        console.log(b);
        assert.equal(b[1], 12000);
        b = await this.emiVest.getMyStats(2, {from: userBob});
        console.log(b);
        assert.equal(b[1], 28000);
      });
  
      it('Can get next unlock date', async function () {
        r = await this.emiVest.freeze(userBob, 4000, 1); // freeze 9000 for 2 years
        expectEvent.inLogs(r.logs,'TokensLocked');
  
        let b = await this.emiVest.getNextUnlock({from: userBob});
        let t = new Date(b[0] * 1000);
        console.log('Bob has next unlock date: ' + t.toString() + ', amount: ' + b[1]);
  
        assert.equal(b[1], 1000);
      });
  
      it('Cannot view other users locks', async function () {
        await this.usdy.transfer(this.emiVest.address, 8000);
        await this.emiVest.freeze(userBob, 8000, 3); // freeze 8000 for 2 years quarterly
  
        expectRevert.unspecified(this.emiVest.getLock(userBob, 0, {from: userBob}));
      });
  
    });
  
    describe('As an admin user we', async function () {
      beforeEach(async function() {
        await this.usdy.transfer(this.emiVest.address, 4000);
        await this.emiVest.freeze(userBob, 4000, 1); // freeze 9000 for 2 years quarterly
      });
  
      it('Can freeze tokens', async function () {
        await this.usdy.transfer(this.emiVest.address, 7000);
        r = await this.emiVest.freeze(userAlice, 7000, 2); // freeze 9000 for 3 years
        expectEvent.inLogs(r.logs,'TokensLocked');
        let b = await this.emiVest.balanceOf(userAlice);
        assert.equal(b, 7000);
      });
  
      it('Can get user locks length', async function () {
        let b = await this.emiVest.getLocksLen(userBob);
        console.log('Bob has ' + b + ' locks');
  
        assert.equal(b, 1);
      });
  
      it('Can view own locks', async function () {
        let b = await this.emiVest.getMyLock(0, {from: userBob});
        assert.equal(b[1], 4000);
      });
  
      it('Can view all locks', async function () {
        r = await this.emiVest.freeze(userAlice, 11000, 1); // freeze 9000 for 2 years
        expectEvent.inLogs(r.logs,'TokensLocked');
        b = await this.emiVest.getLock(userBob, 0);
        assert.equal(b[1], 4000);
        b = await this.emiVest.getLock(userAlice, 0);
        assert.equal(b[1], 11000);
      });
    });
  });