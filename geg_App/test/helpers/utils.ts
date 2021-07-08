import {expect} from 'chai';

import { waffle, ethers } from "hardhat";
import {Contract, ContractFactory, utils, constants, BigNumber} from 'ethers';


export function fail() {
    expect.fail("impement me")
}

export var thousand : BigNumber = utils.parseEther("1000.0");

export var ethToken : string = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";