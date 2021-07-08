const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const { upgradeProxy } = require("@openzeppelin/truffle-upgrades");

const mnemonic = fs.readFileSync(".secret").toString().trim();

async function main() {
    console.log("Updating Oracle to V2...");
    const oracle_address = "0x457141CD87758143fB84011CB8D26D4B42002D82"
    const OracleV2 = await ethers.getContractFactory("Oracle");
    // const oracle = await Oracle.attach(oracle_address);
    const oracle = await upgrades.upgradeProxy(oracle_address, Oracle);
    console.log("Oracle updated: ", oracle.address);
}
  
main();
