// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.2;

import "@openzeppelin/contracts/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEmiVoting.sol";

/**
 * @dev Returns the current implementation of `proxy`.
 *
 * Requirements:
 *
 * - This contract must be the admin of `proxy`.
 */
contract EmiVotableProxyAdmin is Ownable {
    using SafeMath for uint256;

    IEmiVoting private _votingContract;

 string public codeVersion = "VotableProxyAdmin v1.0-145-gf234c9e";

    constructor(address _vc) public {
        require(_vc != address(0), "Voting contract address cannot be 0");
        _votingContract = IEmiVoting(_vc);
    }

    /**
     * @dev Returns the current implementation of `proxy`.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    function getProxyImplementation(TransparentUpgradeableProxy proxy)
        public
        view
        returns (address)
    {
        // We need to manually run the static call since the getter cannot be flagged as view
        // bytes4(keccak256("implementation()")) == 0x5c60da1b
        (bool success, bytes memory returndata) =
            address(proxy).staticcall(hex"5c60da1b");
        require(success);
        return abi.decode(returndata, (address));
    }

    /**
     * @dev Returns the current admin of `proxy`.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    function getProxyAdmin(TransparentUpgradeableProxy proxy)
        public
        view
        returns (address)
    {
        // We need to manually run the static call since the getter cannot be flagged as view
        // bytes4(keccak256("admin()")) == 0xf851a440
        (bool success, bytes memory returndata) =
            address(proxy).staticcall(hex"f851a440");
        require(success);
        return abi.decode(returndata, (address));
    }

    /**
     * @dev Changes the admin of `proxy` to `newAdmin`.
     *
     * Requirements:
     *
     * - This contract must be the current admin of `proxy`.
     */
    function changeProxyAdmin(
        TransparentUpgradeableProxy proxy,
        address newAdmin
    ) public onlyOwner {
        proxy.changeAdmin(newAdmin);
    }

    function changeVoting(address _newVoting) external onlyOwner {
        require(_newVoting != address(0), "Address cannot be 0");
        _votingContract = IEmiVoting(_newVoting);
    }

    function upgrade(TransparentUpgradeableProxy proxy, uint256 votingHash)
        public
        onlyOwner
    {
        address impl;

        impl = _votingContract.getVotingResult(votingHash);
        require(impl != address(0), "Voting has wrong implementation address");

        proxy.upgradeTo(impl);
    }
}
