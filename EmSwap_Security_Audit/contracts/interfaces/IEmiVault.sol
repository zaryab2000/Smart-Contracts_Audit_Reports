// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IEmiVault {
    function totalValue() external view returns (uint256);

    function setDividendToken(address) external;
}
