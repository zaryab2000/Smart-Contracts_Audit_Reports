// File: @openzeppelin/contracts/proxy/Initializable.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.2;

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since a proxied contract can't have a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 * 
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {UpgradeableProxy-constructor}.
 * 
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 */
abstract contract Initializable {

    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializer() {
        require(_initializing || _isConstructor() || !_initialized, "Initializable: contract is already initialized");

        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
        }
    }

    /// @dev Returns true if and only if the function is running in the constructor
    function _isConstructor() private view returns (bool) {
        // extcodesize checks the size of the code stored in an address, and
        // address returns the current address. Since the code is still not
        // deployed when running a constructor, any checks on its code size will
        // yield zero, making it an effective way to detect if a contract is
        // under construction or not.
        address self = address(this);
        uint256 cs;
        // solhint-disable-next-line no-inline-assembly
        assembly { cs := extcodesize(self) }
        return cs == 0;
    }
}
 

contract EmiReferral is Initializable {
    uint256 public l1ReferralShare = 50; // 5%
    uint256 public l2ReferralShare = 30; // 3%
    uint256 public l3ReferralShare = 10; // 1%

    mapping(address => address) public referrals;

    // !!!In updates to contracts set new variables strictly below this line!!!
    //-----------------------------------------------------------------------------------

 string public codeVersion = "EmiReferral v1.0-113-g96f8394";

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
