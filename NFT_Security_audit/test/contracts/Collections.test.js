const { assert } = require("chai");

let id = 1;
const uri = "https://example.com/{id}.json";
const image = "https://example.com/{id}.jpeg";

// Create a contract object from a compilation artifact
const NFTFactory = artifacts.require('NFTFactory');
const Collections = artifacts.require('Collections');
const ERC20Mock = artifacts.require('ERC20Mock');



contract('Collection', ([owner, alice, bob]) => {
  let messi;
  let ali;
  let factory;
  let ern;
  let messiAddress;
  let aliAddress;

  before(async function () {
    ern = await ERC20Mock.new('Mock Token', 'MOCK', 1e5, { from: owner });
    toAddress = await ERC20Mock.new('Wallet Account', "WALLET", 0, { from: owner });
    factory = await NFTFactory.new();

    let balance = await ern.balanceOf(owner);
    assert.equal(balance.valueOf(), 100000);

    await ern.mint(alice, 25000);
    await ern.mint(bob, 75000);
    const balanceAlice = await ern.balanceOf(alice);
    const balanceBob = await ern.balanceOf(bob);
    assert.equal(balanceAlice.toString(), 25000);
    assert.equal(balanceBob.toString(), 75000);
  });

  it('should deployed (ERC20Mock)', async function () {
    const name = await ern.name();
    const symbol = await ern.symbol();

    assert.equal(name, 'Mock Token');
    assert.equal(symbol, 'MOCK');

  })

  describe('create Collections', () => {
    it('creating collections with different ids', async () => {
      messi = await factory.createCollection(uri, id + 10 * 10e5);
      ali = await factory.createCollection(uri, id + 20 * 10e5);


      [messi, ali] = await factory.getChildren();
      aliAddress = ali;

      messi = await Collections.at(messi);
      ali = await Collections.at(ali);

      await messi.addErnAddress(ern.address);
      await ali.addErnAddress(ern.address);

      assert.notEqual(messi, ali);

    });
  });

  describe('adding single card', async () => {
    it('adding cards to ronaldo and messi', async () => {
      await messi.addCard(owner, 1000001, 50);
      await messi.addCard(owner, 1000002, 50);
      await ali.addCard(owner, 1000001, 50);

      const quantity = await messi.quantity();

      assert.equal(quantity, 2);
    });

    it('should give error about card id already exists', async function () {
      try {
        await ali.addCard(owner, 1000001, 50)
      } catch (error) {
        assert.equal(error.message, 'Card id already exists.');
      }
    });
  })

  describe('adding batch cards', async function () {
    it('adding cards to ronaldo and messi', async function () {
      await messi.addCardBatch([owner, owner], [id + 2, id + 3], [500, 1000]);
      await ali.addCardBatch([owner, owner], [id + 2, id + 3], [500, 1000]);

      assert.equal(await messi.quantity(), 4);
      assert.equal(await ali.quantity(), 3);
    })

  });

  describe('this.nft buy', async function () {
    it('buys with ern', async function () {
      await messi.approveTokens(5000000000000000, { from: alice });
      await messi.buyByErn(1000001, { from: alice });
      const aliceBalance = await ern.balanceOf(alice);
      const aliceNFT = await messi.balanceOf(alice, 1000001);
      assert.equal(aliceNFT.toString(), 1);
      assert.equal(aliceBalance.toString(), 74950);
    })

    it('buys with ether', async function () {

    });

    it('buys with stones', async function () {

    })
  })
});
