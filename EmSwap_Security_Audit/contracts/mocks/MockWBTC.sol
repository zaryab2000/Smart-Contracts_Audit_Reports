// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWBTC is ERC20 {
    uint256 private constant _INITIAL_SUPPLY = 21000000 * (10**8);

    constructor() public ERC20("WBTC wraped bitcoin", "WBTC") {
        _setupDecimals(8);
        _mint(msg.sender, _INITIAL_SUPPLY);
    }
}
