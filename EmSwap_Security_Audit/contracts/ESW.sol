// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.2;

import "@openzeppelin/contracts/proxy/Initializable.sol";
import "./interfaces/IEmiVesting.sol";
import "./libraries/Priviledgeable.sol";
import "./libraries/ProxiedERC20.sol";
import "./libraries/OracleSign.sol";

contract ESW is ProxiedERC20, Initializable, Priviledgeable, OracleSign {
    address public dividendToken;
    address public vesting;
    uint256 internal _initialSupply;
    mapping(address => uint256) internal _mintLimit;
    mapping(address => bool) internal _mintGranted; // <-- been used in previouse implementation, now just reserved at proxy storage

    // !!!In updates to contracts set new variables strictly below this line!!!
    //-----------------------------------------------------------------------------------
 string public codeVersion = "ESW v1.0-145-gf234c9e"; 
    uint256 public constant MAXIMUM_SUPPLY = 200_000_000e18;
    bool public isFirstMinter = true;
    address public constant firstMinter =
        0xdeb5A983AdC9b25b8A96ae43a65953Ded3939de6; // set to Oracle
    address public constant secondMinter =
        0x9Cf73e538acC5B2ea51396eA1a6DE505f6a68f2b; //set to EmiVesting
    uint256 public minterChangeBlock;

    event MinterSwitch(address newMinter, uint256 afterBlock);

    mapping(address => uint256) public walletNonce;

    function initialize() public virtual initializer {
        _initialize("EmiDAO Token", "ESW", 18);
        _addAdmin(msg.sender);
    }

    /*********************** admin functions *****************************/

    function updateTokenName(string memory newName, string memory newSymbol)
        public
        onlyAdmin
    {
        _updateTokenName(newName, newSymbol);
    }

    /**
     * switchMinter - function for switching between two registered minters
     * @param isSetFirst - true - set first / false - set second minter
     */

    function switchMinter(bool isSetFirst) public onlyAdmin {
        isFirstMinter = isSetFirst;
        minterChangeBlock = block.number + 6646; // 6646 ~24 hours
        emit MinterSwitch(
            (isSetFirst ? firstMinter : secondMinter),
            minterChangeBlock
        );
    }

    /**
     * set mint limit for exact contract wallets
     * @param account - wallet to set mint limit
     * @param amount - mint limit value
     */

    function setMintLimit(address account, uint256 amount) public onlyAdmin {
        _mintLimit[account] = amount;
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        super.transfer(recipient, amount);
        return true;
    }

    /*********************** public functions *****************************/

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        super.transferFrom(sender, recipient, amount);
        return true;
    }

    function burn(uint256 amount) public {
        super._burn(msg.sender, amount);
    }

    function burnFromVesting(uint256 amount) external {
        require(msg.sender == vesting, "Only vesting!");
        burn(amount);
    }

    /**
     * mintSigned - oracle signed function allow user to mint ESW tokens
     * @param recipient - user's wallet for receiving tokens
     * @param amount - amount to mint
     * @param nonce - user's mint request number, for security purpose
     * @param sig - oracle signature, oracle allowance for user to mint tokens
     */

    function mintSigned(
        address recipient,
        uint256 amount,
        uint256 nonce,
        bytes memory sig
    ) public {
        require(recipient == msg.sender, "ESW:sender");
        // check sign
        bytes32 message =
            _prefixed(
                keccak256(abi.encodePacked(recipient, amount, nonce, this))
            );

        require(
            _recoverSigner(message, sig) == getOracle() &&
                walletNonce[msg.sender] < nonce,
            "ESW:sign"
        );

        walletNonce[msg.sender] = nonce;

        _mintAllowed(getOracle(), recipient, amount);
    }

    /*********************** view functions *****************************/

    function initialSupply() public view returns (uint256) {
        return _initialSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    /**
     * getMintLimit - read mint limit for wallets
     * @param account - wallet address
     * @return - mintlimit for requested wallet
     */

    function getMintLimit(address account) public view returns (uint256) {
        return _mintLimit[account];
    }

    function getWalletNonce() public view returns (uint256) {
        return walletNonce[msg.sender];
    }

    /**
     *first minter address after minterChangeBlock, second before minterChangeBlock
     *second minter address after minterChangeBlock, first before minterChangeBlock
     */
    function getOracle() public view returns (address) {
        return (
            (
                isFirstMinter
                    ? (
                        block.number >= minterChangeBlock
                            ? firstMinter
                            : secondMinter
                    )
                    : (
                        block.number >= minterChangeBlock
                            ? secondMinter
                            : firstMinter
                    )
            )
        );
    }

    /*********************** internal functions *****************************/

    function _mintAllowed(
        address allowedMinter,
        address recipient,
        uint256 amount
    ) internal {
        require(
            totalSupply().add(amount) <= MAXIMUM_SUPPLY,
            "ESW:supply_exceeded"
        );
        _mintLimit[allowedMinter] = _mintLimit[allowedMinter].sub(amount);
        super._mint(recipient, amount);
    }
}
