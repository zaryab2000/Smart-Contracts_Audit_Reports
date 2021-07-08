// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFarm {
    function payment(address buyer, uint256 amount) external returns (bool);
}
