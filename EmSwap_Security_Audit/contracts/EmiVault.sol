// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/Priviledgeable.sol";
import "./libraries/OracleSign.sol";

contract EmiVault is Initializable, Priviledgeable, OracleSign {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

 string public codeVersion = "EmiVault v1.0-145-gf234c9e";
 
    // !!!In updates to contracts set new variables strictly below this line!!!
    //-----------------------------------------------------------------------------------

    address public constant ORACLE = 0xdeb5A983AdC9b25b8A96ae43a65953Ded3939de6;
    mapping(address => uint256) public walletNonce;

    function initialize() public initializer {
        _addAdmin(msg.sender);
    }

    function getWalletNonce() public view returns (uint256) {
        return walletNonce[msg.sender];
    }

    /**
     * withdrawTokens - oracle signed function allow user to withdraw dividend tokens
     * @param tokenAddresses - array of token addresses to withdraw
     * @param amounts - array of token amounts to withdraw
     * @param recipient - user's wallet for receiving tokens
     * @param nonce - user's withdraw request number, for security purpose
     * @param sig - oracle signature, oracle allowance for user to withdraw tokens
     */

    function withdrawTokens(
        address[] memory tokenAddresses,
        uint256[] memory amounts,
        address recipient,
        uint256 nonce,
        bytes memory sig
    ) public {
        require(recipient == msg.sender, "EmiVault:sender");
        require(
            tokenAddresses.length > 0 &&
                tokenAddresses.length == amounts.length &&
                tokenAddresses.length <= 60,
            "EmiVault:length"
        );
        // check sign
        bytes32 message =
            _prefixed(
                keccak256(
                    abi.encodePacked(
                        tokenAddresses,
                        amounts,
                        recipient,
                        nonce,
                        this
                    )
                )
            );

        require(
            _recoverSigner(message, sig) == ORACLE &&
                walletNonce[msg.sender] < nonce,
            "EmiVault:sign"
        );

        walletNonce[msg.sender] = nonce;

        for (uint256 index = 0; index < tokenAddresses.length; index++) {
            IERC20(tokenAddresses[index]).transfer(recipient, amounts[index]);
        }
    }
}
