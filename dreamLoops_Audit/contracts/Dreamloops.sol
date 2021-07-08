//SPDX-License-Identifier: UNLICENSED
// *******************ISSUES************************
// What is the official name and symbol?? See constructor
// create a pause function

//Each revert string adds a minimum 20000 gas to your contract deployment cost,
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Bitlectro is
    Ownable,
    Pausable,
    ERC721URIStorage,
    ERC721Enumerable,
    AccessControl
{
    // Role for giveaway and company allocation
    bytes32 public constant GIVEAWAY = keccak256("GIVEAWAY");
    bytes32 public constant COMPANY = keccak256("COMPANY");

    using Counters for Counters.Counter;
    // Pool allocation counters
    Counters.Counter private _giveawayAllocation;
    Counters.Counter private _companyAllocation;
    Counters.Counter private _publicAllocation;

    Counters.Counter private _tokenCounter;
    bool private saleState = false;
    bool private _paused;
    string private _baseTokenURI;
    uint256 public constant MAX_TOKENS = 100;
    uint256 private constant MAX_PUBLIC = 85;
    uint256 private constant MAX_GIVEAWAYS = 5;
    uint256 private constant MAX_COMPANY_ALLOCATION = 10;

    mapping(uint256 => bool) private _isUnwrapped;

    constructor(
        address[] memory admins,
        address[] memory company,
        string memory _newBaseURI
    ) ERC721("Dreamloops V1", "DREAMV1") {
        require(
            MAX_TOKENS - MAX_PUBLIC - MAX_GIVEAWAYS - MAX_COMPANY_ALLOCATION ==
                0,
            "Does not equal"
        );
        _tokenCounter.increment(); // have the tokens start at 1
        _paused = false;
        _baseTokenURI = _newBaseURI;

        // provision admin roles
        for (uint256 i = 0; i < admins.length; i++) {
            _setupRole(DEFAULT_ADMIN_ROLE, admins[i]);
        }

        // provision company employee role.
        for (uint256 i = 0; i < company.length; i++) {
            _setupRole(COMPANY, company[i]);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
        require(!paused()); //dev: "Token transfer is paused."
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721URIStorage, ERC721)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    // Security

    modifier onlyAdmin() {
        require(
            hasRole(getRoleAdmin(DEFAULT_ADMIN_ROLE), _msgSender()) ||
                owner() == _msgSender(),
            "Caller is not an admin or owner."
        );
        _;
    }

    /**
     * @dev Grants `role` to `account`, can only be accessed by the contract owner.
     */
    function grantRoleOwner(bytes32 role, address account)
        public
        virtual
        onlyOwner
    {
        _setupRole(role, account);
    }

    //Token Utils

    /**
     * @notice Initial base url of the token.
     * @return string of the baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // Sets the base URI.
    function setBaseURI(string memory _newBaseURI) public onlyAdmin {
        _baseTokenURI = _newBaseURI;
    }

    // Price Banding and Sale control

    /**
     * @dev See {Pausable}
     */
    function _pause() internal virtual override whenNotPaused onlyAdmin {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev See {Pausable}
     */
    function _unpause() internal virtual override whenPaused onlyAdmin {
        _paused = false;
        emit Unpaused(_msgSender());
    }

    /**
     * @notice Starts the public sale mechanism.
     */
    function setSale() public onlyAdmin {
        saleState = true;
    }

    /**
     * @notice Sale state accessor.
     * @return boolean of sale state.
     */

    function isSaleStarted() public view returns (bool) {
        return saleState;
    }

    /**
     * @notice Bonding curve utility function. Calculates a token retail price.
     * @param _id a token id, minted or not.
     * @dev This is simply an illustration of the bonding curve. We MUST implement our strategy before release!!
     */

    function bondingCurve(uint256 _id) private view returns (uint256) {
        if (_id >= 50) {
            return 20000000000000000; // 0.02 ETH 50+
        } else {
            return 10000000000000000; // 0.01 ETH 1-49
        }
    }

    /**
     * @notice Returns the mint price of the next token to be minted.
     * @return uint256 representation of the current price in wei.
     */

    function calculatePrice() public view returns (uint256) {
        uint256 currentSupply = totalSupply();
        return bondingCurve(currentSupply);
    }

    /**
     * @notice Returns the retail price of a specific Token
     * @return uint256 representation of the specific price in wei.
     */

    function calculatePriceForToken(uint256 _id) public view returns (uint256) {
        return bondingCurve(_id);
    }

    /**
     * @notice Returns remaining number of company allocation.
     */
    function remainingCompanyAllocation() public view returns (uint256) {
        return MAX_COMPANY_ALLOCATION - _companyAllocation.current();
    }

    /**
     * @notice Returns remaining number of giveaways.
     */
    function remainingGiveaways() public view returns (uint256) {
        return MAX_GIVEAWAYS - _giveawayAllocation.current();
    }

    /**
     * @notice Returns remaining number of public.
     */
    function remainingPublic() public view returns (uint256) {
        return MAX_PUBLIC - _publicAllocation.current();
    }

    /**
     * @notice Returns remaining number of giveaways.
     * @param giveawayUsers an array of addresses to add to the giveaway role
     */
    function addGiveawayUsers(address[] memory giveawayUsers) public onlyAdmin {
        //get array length
        uint256 len = giveawayUsers.length;
        require(len > 0, "Need to pass at least one address"); // Is this needed?

        // apply the giveaway role to provided array.
        for (uint256 i = 0; i < len; i++) {
            grantRole(GIVEAWAY, giveawayUsers[i]);
        }
    }

    /**
     * @notice Allows for a giveaway user to redeem a token,
     *       the user role is immediately removed.
     */
     function redeemGiveaway() public whenNotPaused {
        require(
            hasRole(GIVEAWAY, _msgSender()),
            "Address not part of the giveaway."
        );

        require(remainingGiveaways() > 0, "No Giveaway tokens left.");

        //
        renounceRole(GIVEAWAY, _msgSender());
        uint256 nextToken = _tokenCounter.current();

        _isUnwrapped[nextToken] = false;
         _safeMint(msg.sender, nextToken);
        _tokenCounter.increment();
        _giveawayAllocation.increment();
     
    }
    // Token Unwrap

    function isUnwrapped(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _isUnwrapped[tokenId];
    }

    /**
    @notice This function sets a boolean isUnwrapped
    @param tokenId the tokenID for the NFT that is being unwrapped
    */

    function unwrapToken(uint256 tokenId) public {
        require(_exists(tokenId), "Cannot wrap a non-existant token.");
        require(
            ownerOf(tokenId) == _msgSender() || _msgSender() == owner(),
            "Not owner of token."
        );
        require(isUnwrapped(tokenId) == false, "Token is already unwrapped");
        _isUnwrapped[tokenId] = true;
    }

    /**
     * @notice The standard minting operation for point of sale.
     */
    function mint(uint256 quantity) public payable whenNotPaused {
        require(quantity > 0, "You must purchase at least one token");
        require(saleState == true, "Sale has not started");

        require(remainingPublic() >= quantity, "Exceeds max tokens.");
        require(
            msg.value == calculatePrice() * quantity,
            "Not enough ETH sent for transaction"
        );

        for (uint256 i = 0; i < quantity; i++) {
            uint256 nextToken = _tokenCounter.current();
            
            _isUnwrapped[nextToken] = false;
            _safeMint(msg.sender, nextToken);
            _publicAllocation.increment();
            _tokenCounter.increment();
            
        }
    }

    /**
     * @notice The standard minting operation company allocations.
     */
    function companyMint(address to) public {
        require(hasRole(COMPANY, _msgSender()), "User does not have role");
        require(remainingCompanyAllocation() > 0, "Pool is empty");
        uint256 nextToken = _tokenCounter.current();
       
        _isUnwrapped[nextToken] = false;
        _safeMint(to, nextToken);
        _companyAllocation.increment();
        _tokenCounter.increment();
         
    }

    /**
     * @notice Withdraw the balance of the contract to the contract owner.
     */
    function withdrawAll() public payable onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }
}
