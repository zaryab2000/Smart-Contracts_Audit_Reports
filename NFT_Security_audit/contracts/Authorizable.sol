// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Authorizeable is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _authorizedAddresses;

    function addAuthorizedAddress(address address_) external onlyOwner {
        _authorizedAddresses.add(address_);
    }

    function removeAuthorizedAddress(address address_) external onlyOwner {
        _authorizedAddresses.remove(address_);
    }

    modifier onlyAuthorized() {
        require(
            _authorizedAddresses.contains(msg.sender),
            "Sender not authorized."
        );
        _;
    }
}
