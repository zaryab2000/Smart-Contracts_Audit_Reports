const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const { upgradeProxy } = require("@openzeppelin/truffle-upgrades");

const mnemonic = fs.readFileSync(".secret").toString().trim();

async function main() {
    console.log("Deploing ERC20 contracts...");
    const GEG_ADDRESS = "0x4575b1F07ba8dD9F58667afab8F064fCb937ec15";
    const oracle_address = "0x457141CD87758143fB84011CB8D26D4B42002D82"

    const ERC20 = await ethers.getContractFactory("mockERC20");
    const usdt = await ERC20.deploy("USDT", "USDT", ethers.utils.parseEther("100000"));

    const GEG = await ethers.getContractFactory("GEG");
    const geg = await GEG.attach(GEG_ADDRESS);

    const OracleV2 = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.attach(oracle_address);

    const GErc20 = await ethers.getContractFactory("GErc20");
    const gegBank = await upgrades.deployProxy(GErc20, [86400 * 2 * 365, 5, 25, geg.address,  oracle.address], { initializer: "initialize", unsafeAllowCustomTypes: true, gas: 8000000});
    await gegBank.setOracle(oracle.address);
    await gegBank.setUnderlying(geg.address);

    console.log("GEG Bank deployed: ", gegBank.address);

    const usdtBank = await upgrades.deployProxy(gERC20, [86400 * 2 * 365, 5, 25, geg.address,  oracle.address], { initializer: "initialize", unsafeAllowCustomTypes: true, gas: 8000000});
    await usdtBank.setOracle(oracle.address);
    await usdtBank.setUnderlying(usdt.address);

    console.log("USDT Bank deployed: ", usdtBank.address);
}
  
main();
