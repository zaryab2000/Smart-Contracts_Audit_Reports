// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDZ is ERC20 {
    uint256 private constant _INITIAL_SUPPLY =
        100000000 *
            (10 **
                /* 23 */
                6);

    constructor() public ERC20("USDZ stable coin", "USDZ") {
        _setupDecimals(
            /* 23 */
            6
        );
        _mint(msg.sender, _INITIAL_SUPPLY);
    }
}
