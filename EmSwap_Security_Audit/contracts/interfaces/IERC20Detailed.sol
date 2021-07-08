// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

/**
 * @dev Interface of the DAO token.
 */
interface IERC20Detailed {
    function name() external returns (string memory);

    function symbol() external returns (string memory);

    function decimals() external returns (uint8);

    function mint(address account, uint256 amount) external;
}
