const BirdOracle = artifacts.require('BirdOracle');
const BirdToken = artifacts.require('BirdToken');

const localDeployScript = async (deployer) => {
  console.log('Deploying to local blockchain');
  await deployer.deploy(BirdToken);
  await deployer.deploy(BirdOracle, BirdToken.address);
};

const kovanDeployScript = async (deployer) => {
  console.log('Deploying to kovan');
  const birdTokenAddress = '0xee426697da6885e7c8c0d48255de85ac412dd7b9';
  await deployer.deploy(BirdOracle, birdTokenAddress);
};

const mainnetDeployScript = async (deployer) => {
  console.log('Deploying to Mainnet');
  const birdTokenAddress = '0x70401dFD142A16dC7031c56E862Fc88Cb9537Ce0';
  await deployer.deploy(BirdOracle, birdTokenAddress);
};

const defaultDeployScript = async (deployer) => {
  console.log('Deploying to Mainnet');
  const birdTokenAddress = '0x70401dFD142A16dC7031c56E862Fc88Cb9537Ce0';
  await deployer.deploy(BirdOracle, birdTokenAddress);
};

module.exports = async (deployer, network) => {
  switch (network) {
    case 'mainnet':
      mainnetDeployScript(deployer);
      break;

    case 'kovan':
      kovanDeployScript(deployer);
      break;

    case 'development':
    case 'develop':
      localDeployScript(deployer);
      break;

    default:
      console.log('default: ', network);
      defaultDeployScript(deployer);
  }
};
