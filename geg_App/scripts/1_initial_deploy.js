const { ethers, upgrades } = require("hardhat");


async function main() {
    console.log("Deploying Bank...");
    
    const Oracle = await ethers.getContractFactory("OracleV1");
    const oracle = await upgrades.deployProxy(Oracle, [], { initializer: "initialize", unsafeAllowCustomTypes: true, gas: 8000000});
    console.log("Oracle deployed to:", oracle.address);

    const GEG = await ethers.getContractFactory("GEG");
    const geg = await GEG.deploy(ethers.utils.parseEther("100000"));
    console.log("GEG deployed to:", geg.address);

    const BankV3 = await ethers.getContractFactory("gETH");
    const bank = await upgrades.deployProxy(BankV3, ["GEG Token", "GEG", 86400 * 3 * 30, 5, 25, geg.address,  oracle.address], { initializer: "initialize", unsafeAllowCustomTypes: true, gas: 8000000});
    // const box = await upgrades.deployProxy(Box, [42], { initializer: 'store' });
    await bank.deployed();
    console.log("Box deployed to:", bank.address);
  }
  
  main();
