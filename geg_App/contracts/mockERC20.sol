// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20 Token
 * @dev mostly for dev/test usage
 */
contract MockErc20 is Ownable, ERC20 {
    /**
     * @notice Constructor
     * @param name of Token
     * @param symbol of Token
     * @param supply of emission
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public ERC20(name, symbol) {
        _mint(msg.sender, supply);
    }
}
