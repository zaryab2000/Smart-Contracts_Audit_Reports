// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.2;

/*************************************************************************
 *    EmiVesting inerface
 *
 ************************************************************************/
interface IEmiVesting {
    function balanceOf(address beneficiary) external view returns (uint256);

    function getCrowdsaleLimit() external view returns (uint256);
}
