// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

interface IEmiReferral {
    function l1ReferralShare() external pure returns (uint256);

    function l2ReferralShare() external pure returns (uint256);

    function l3ReferralShare() external pure returns (uint256);

    function getRefStakes()
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function addReferral(address _user, address _referral) external;

    function getReferralChain(address _user)
        external
        returns (address[] memory);
}
