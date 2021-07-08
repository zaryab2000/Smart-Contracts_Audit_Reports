// SPDX-License-Identifier: MIT
// Latest stable version of solidity
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collections.sol";

contract NFTFactory is Ownable {
    using EnumerableSet for EnumerableSet.UintSet;

    EnumerableSet.UintSet private _ids;
    Collections[] children;
    event CollectionCreated(address owner, address deployedAt);

    constructor() {}

    function createCollection(
        string memory uri,
        uint256 _id,
        address _toAddress
    ) public onlyOwner returns (Collections) {
        require(_ids.add(_id), "id should be unique");
        Collections child = new Collections(uri, _toAddress);
        child.transferOwnership(owner());
        children.push(child);

        emit CollectionCreated(owner(), address(child));
        return child;
    }

    function getChildren() external view returns (Collections[] memory) {
        return children;
    }

    function getLengthOfCollections() external view returns (uint256) {
        return children.length;
    }

   
}
