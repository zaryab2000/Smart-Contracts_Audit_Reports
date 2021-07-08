// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../interfaces/IOneSplit.sol";

contract OneSplitMock is IOneSplit {
    function getExpectedReturn(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 parts,
        uint256 flags
    )
        external
        view
        virtual
        override
        returns (uint256 returnAmount, uint256[] memory distribution)
    {
        uint256[] memory p = new uint256[](3);

        return (320 * amount, p);
    }
}
