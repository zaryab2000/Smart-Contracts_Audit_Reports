// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDY is ERC20 {
    uint256 private constant _INITIAL_SUPPLY =
        100000000 *
            (10 **
                /* 18 */
                8);

    constructor() public ERC20("USDY stable coin", "USDY") {
        _setupDecimals(
            /* 18 */
            8
        );
        _mint(msg.sender, _INITIAL_SUPPLY);
    }
}
