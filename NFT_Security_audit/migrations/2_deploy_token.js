const Collections = artifacts.require("Collections.sol");
const NFTFactory = artifacts.require("NFTFactory.sol");
const ERC20Mock = artifacts.require("ERC20Mock");

const uri = "https://us-central1-misterbeast.cloudfunctions.net/metadata/get/{id}"
const test = true

module.exports = async (_deployer) => {

  if (!test) {
    await _deployer.deploy(NFTFactory);
  }

  await _deployer.deploy(ERC20Mock, 'Mock Token', 'MOCK', 1e5);

  const mock = await ERC20Mock.deployed();
  await _deployer.deploy(NFTFactory);

  await _deployer.deploy(Collections, uri);

  return _deployer;
}