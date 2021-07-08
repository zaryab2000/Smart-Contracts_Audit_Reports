// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.2;

import "@openzeppelin/contracts/proxy/Initializable.sol";

contract EmiReferral is Initializable {
    uint256 public l1ReferralShare = 50; // 5%
    uint256 public l2ReferralShare = 30; // 3%
    uint256 public l3ReferralShare = 10; // 1%

    mapping(address => address) public referrals;

    // !!!In updates to contracts set new variables strictly below this line!!!
    //-----------------------------------------------------------------------------------

 string public codeVersion = "EmiReferral v1.0-145-gf234c9e";

    mapping(address => bool) private _refGranted;
    mapping(address => bool) private _adminTable;
    bool private _oneRun; // default false

    modifier onlyOneRun() {
        require(!_oneRun, "Referral: only once");
        _;
    }

    modifier onlyAdmin() {
        require(_adminTable[msg.sender], "Referral: caller is not admin");
        _;
    }

    modifier refGranted() {
        require(_refGranted[msg.sender], "Referral: caller is not alowed");
        _;
    }

    // Admin funcitons

    function grantRef(address _newIssuer) public onlyAdmin {
        require(_newIssuer != address(0), "Referral: Zero address");
        _refGranted[_newIssuer] = true;
    }

    function revokeRef(address _revokeIssuer) public onlyAdmin {
        require(_revokeIssuer != address(0), "Referral: Zero address");
        if (_refGranted[_revokeIssuer]) {
            _refGranted[_revokeIssuer] = false;
        }
    }

    function setAdminOnce() public onlyOneRun {
        _adminTable[msg.sender] = true;
        _oneRun = true;
    }

    function initialize() public initializer {
        l1ReferralShare = 50; // 5%
        l2ReferralShare = 30; // 3%
        l3ReferralShare = 10;
    }

    // Core functions

    function getRefStakes()
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (l1ReferralShare, l2ReferralShare, l3ReferralShare);
    }

    function addReferral(address _user, address _referral)
        external
        refGranted()
    {
        referrals[_user] = _referral;
    }

    // View methods

    function getReferralChain(address _user)
        external
        view
        returns (address[] memory userReferrals)
    {
        address l1 = referrals[_user];

        // len == 0
        if (l1 == address(0)) {
            return userReferrals;
        }

        // len == 1
        address l2 = referrals[l1];
        if (l2 == address(0)) {
            userReferrals = new address[](1);
            userReferrals[0] = l1;
            return userReferrals;
        }

        // len == 2
        address l3 = referrals[l2];
        if (l3 == address(0)) {
            userReferrals = new address[](2);
            userReferrals[0] = l1;
            userReferrals[1] = l2;

            return userReferrals;
        }

        // len == 3
        userReferrals = new address[](3);
        userReferrals[0] = l1;
        userReferrals[1] = l2;
        userReferrals[2] = l3;
    }
}
