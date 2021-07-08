const { accounts } = require('@openzeppelin/test-environment');
const { contract } = require('./twrapper');

const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const ImplV1 = contract.fromArtifact('DummyImplementation');
const ImplV2 = contract.fromArtifact('DummyImplementationV2');
const ProxyAdmin = contract.fromArtifact('EmiVotableProxyAdmin');
const EmiVoting = contract.fromArtifact('EmiVoting');
const TransparentUpgradeableProxy = contract.fromArtifact('TransparentUpgradeableProxy');

describe.skip('ProxyAdmin', function () {
  const [proxyAdminOwner, newAdmin, anotherAccount] = accounts;

  before('set implementations', async function () {
    this.implementationV1 = await ImplV1.new();
    this.implementationV2 = await ImplV2.new();
  });

  beforeEach(async function () {
    const initializeData = Buffer.from('');
    this.emiVote = await EmiVoting.new();
    await this.emiVote.initialize(proxyAdminOwner);

    this.proxyAdmin = await ProxyAdmin.new(this.emiVote.address, { from: proxyAdminOwner });
    this.proxy = await TransparentUpgradeableProxy.new(
      this.implementationV1.address,
      this.proxyAdmin.address,
      initializeData,
      { from: proxyAdminOwner },
    );
  });

  it('has an owner', async function () {
    expect(await this.proxyAdmin.owner()).to.equal(proxyAdminOwner);
  });

  describe('#getProxyAdmin', function () {
    it('returns proxyAdmin as admin of the proxy', async function () {
      const admin = await this.proxyAdmin.getProxyAdmin(this.proxy.address);
      expect(admin).to.be.equal(this.proxyAdmin.address);
    });
  });

  describe('#changeProxyAdmin', function () {
    it('fails to change proxy admin if its not the proxy owner', async function () {
      await expectRevert(
        this.proxyAdmin.changeProxyAdmin(this.proxy.address, newAdmin, { from: anotherAccount }),
        'caller is not the owner',
      );
    });

    it('changes proxy admin', async function () {
      await this.proxyAdmin.changeProxyAdmin(this.proxy.address, newAdmin, { from: proxyAdminOwner });
      expect(await this.proxy.admin.call({ from: newAdmin })).to.eq(newAdmin);
    });
  });

  describe('#getProxyImplementation', function () {
    it('returns proxy implementation address', async function () {
      const implementationAddress = await this.proxyAdmin.getProxyImplementation(this.proxy.address);
      expect(implementationAddress).to.be.equal(this.implementationV1.address);
    });
  });

  describe('#upgrade', function () {
    context('with unauthorized account', function () {
      it('fails to upgrade', async function () {
        await expectRevert(
          this.proxyAdmin.upgrade(this.proxy.address, this.implementationV2.address, { from: anotherAccount }),
          'caller is not the owner',
        );
      });
    });

    context('with authorized account', function () {
      it('upgrades implementation', async function () {
        let releaseTime = (await time.latest()).add(time.duration.minutes(2));
        let h = 51940;
        await this.emiVote.newUpgradeVoting(this.implementationV1.address, this.implementationV2.address, releaseTime, h);
        await time.increaseTo(releaseTime.add(time.duration.minutes(4)));
        await this.emiVote.calcVotingResult(h);
 
        let j = await this.emiVote.getVotingResult(h);

        await this.proxyAdmin.upgrade(this.proxy.address, h, { from: proxyAdminOwner });
        const implementationAddress = await this.proxyAdmin.getProxyImplementation(this.proxy.address);
        expect(implementationAddress).to.be.equal(this.implementationV2.address);
      });
    });
  });
});