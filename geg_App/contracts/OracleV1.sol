// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16 <0.8.0;

import {Oracle} from "./OracleInterface.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";

import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @title GEG.Finance's Oracle Implementation
 * @author GEG.Finance
 */
contract OracleV1 is Oracle, OwnableUpgradeable {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    mapping(address => uint256) public rates;
    address public baseToken;
    uint256 internal constant EXPIRATION = 60 * 30; // 30 minutes

    mapping(address => uint256) public updated;

    // deal with ETH as token
    address public constant ETH_TOKEN =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Set ETH to Reward token exchange rate
     * @dev FIXME replace all usage of that method with setRate
     * @param _amount of Reward coins per 1 ETH
     */
    function setETHrate(uint256 _amount) external override onlyOwner {
        _setRate(ETH_TOKEN, _amount);
    }

    // /**
    //  * @dev Set ETH<->GEG exchange rate from signed message
    //  * It will be used to allow other users set exchange rate if they were allowed by owner
    //  */
    // function setEthRateSigned(bytes32 hash, bytes memory signature)  external{
    // }

    /**
     * @notice Convert ERC20 token to Reward token
     * @param _address of ERC20 token
     * @param _amount of ETH coins
     * @return amount of reward token
     */
    function convert(address _address, uint256 _amount)
        external
        view
        override
        returns (uint256)
    {
        if (_address == baseToken) {
            return _amount;
        }
        uint256 latest = rates[_address];
        require(latest > 0, "Zero convertion rate.");
        return (_amount * latest) / 1 ether;
    }

    /**
     * @notice Set ERC20 to Reward token exchange rate
     * @param _address of ERC20 token
     * @param _amount of Reward coins per 1 ERC20 token
     */
    function setRate(address _address, uint256 _amount)
        external
        override
        onlyOwner
    {
        _setRate(_address, _amount);
    }

    /**
     * @notice Set exchange rate using owners signature
     * @dev Backend generates signature for structure(TokenAddres,Rate,Current Timestamp)
     * and pass it to any user. User will use that data to update exchange rate
     * @param _address of ETH/ERC20 token
     * @param _amount of Reward coins per 1 token
     * @param _timestamp curerent timestamp
     * @param _sig is message signature
     */
    function setRateSigned(
        address _address,
        uint256 _amount,
        uint256 _timestamp,
        bytes calldata _sig
    ) external override returns (bool) {
        uint256 lastUpdated = updated[_address];
        bool expired = block.timestamp.sub(lastUpdated) > EXPIRATION;

        if (!expired && _timestamp < lastUpdated) {
            // two concurrent requests tried to update rates
            return true;
        }

        require(lastUpdated < _timestamp, "Convertion rate is too old.");

        bytes32 message =
            ECDSA.toEthSignedMessageHash(
                keccak256(abi.encode(_address, _amount, _timestamp))
            );

        if (message.recover(_sig) == owner()) {
            _setRate(_address, _amount);
            return true;
        }
        return false;
    }

    /**
     * @notice Set address of Reward Token
     * @param _address of Reward Token
     */
    function setToken(address _address) external onlyOwner {
        baseToken = _address;
    }

    /**
     * @notice Custom constructor
     */
    function initialize() public initializer {
        OwnableUpgradeable.__Ownable_init();
    }

    /**
     * @notice Set ERC20 to Reward token exchange rate
     * @dev reusable function
     * @param _address of ERC20 token
     * @param _amount of Reward coins per 1 ERC20 token
     */
    function _setRate(address _address, uint256 _amount) internal {
        rates[_address] = _amount;
        updated[_address] = block.timestamp;
    }
}
