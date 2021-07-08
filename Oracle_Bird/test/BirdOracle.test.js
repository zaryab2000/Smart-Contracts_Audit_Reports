const BirdToken = artifacts.require('BirdToken');
const BirdOracle = artifacts.require('BirdOracle');

contract('BirdOracle', (accounts) => {
  let birdToken, birdOracle, startTime;
  beforeEach(async () => {
    birdToken = await BirdToken.new();
    birdOracle = await BirdOracle.new(birdToken.address);
  });

  // Main Test:
  // create a request, add providers, do consensus, display agreed value.
  it('create a request, add providers, do consensus, display agreed value.', async () => {
    let ethAddress = accounts[1],
      attributeToFetch = 'bird_rating',
      provider1 = accounts[2],
      provider2 = accounts[3],
      provider3 = accounts[4];

    //create a request
    await birdOracle.newChainRequest(ethAddress, attributeToFetch);

    //add providers
    await birdOracle.addProvider(provider1);
    await birdOracle.addProvider(provider2);
    await birdOracle.addProvider(provider3);

    //do consensus
    await birdOracle.updatedChainRequest(
      (_id = 0),
      (_response = toWei('1.4')),
      { from: provider1 }
    );
    await birdOracle.updatedChainRequest(
      (_id = 0),
      (_response = toWei('1.4')),
      { from: provider2 }
    );

    //display agreed value.
    console.log(
      'Agreed value: ',
      (await birdOracle.onChainRequests((_id = 0))).value.toString()
    );
  });

  it('add provider, remove provider', async () => {
    let provider1 = accounts[2],
      provider2 = accounts[3],
      provider3 = accounts[4];

    //add providers
    await birdOracle.addProvider(provider1);
    await birdOracle.addProvider(provider2);
    await birdOracle.addProvider(provider3);
    //console.log('trusted providers:', await birdOracle.getProviders());

    //remove provider
    await birdOracle.removeProvider(provider2);
    //console.log('trusted providers:', await birdOracle.getProviders());
  });

  it('can read rating from oracle contract.', async () => {
    const anyAddress = accounts[1];
    let rating = await birdOracle.getRatingByAddress(anyAddress);
  });
});

const checkBalance = (msg, token, account) =>
  token
    .balanceOf(account)
    .then((b) => console.log(msg, 'balance: ', fromWei(b.toString())));

const toWei = (eth) => web3.utils.toWei(eth);

const fromWei = (eth) => web3.utils.fromWei(eth);

//Some other test:
// call all functions in contract
// able to read my rating.
// able to create request on my rating.
// not able to read other rating.
// not able to create request on some other rating.
// able to read other rating after paying bird
// able to create request on other rating after paying bird
