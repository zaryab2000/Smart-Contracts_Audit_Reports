// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

/**
 * @dev Interface of the DAO token.
 */
interface IESW {
    function name() external returns (string memory);

    function symbol() external returns (string memory);

    function decimals() external returns (uint8);

    function balanceOf(address account) external view returns (uint256);

    function mintClaimed(address recipient, uint256 amount) external;

    function burn(uint256 amount) external;

    function burnFromVesting(uint256 amount) external;
}
