//"SPDX-License-Identifier: MIT"
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract DeSpaceNFT is 
    Context, 
    AccessControlEnumerable, 
    ERC721Burnable,
    ERC721URIStorage, 
    ERC721Enumerable {
    
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(uint => address) private _idToArtist;
    mapping(address => bool) private _markets;

    event Mint(
        address indexed admin, 
        uint indexed tokenId, 
        address indexed artist
    );

    event MarketplaceAdded(
        address superAdmin, 
        address indexed marketplace
    );

    event MarketplaceRemoved(
        address superAdmin, 
        address indexed marketplace
    );

    function initialize(
        address _defaultAdmin
        ) public initializer {

        ERC721.init("DeSpace", "DES");
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(ADMIN_ROLE, _defaultAdmin);
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
    }

    function createNFT(
        string memory _tokenURI,
        address artist
        ) external {
        
        require(
            hasRole(
                DEFAULT_ADMIN_ROLE, 
                _msgSender()
            ) 
            || 
            hasRole(
                ADMIN_ROLE, 
                _msgSender()
            ),
            "DeSpaceNFT: must have admin role to mint"
        );
        
        _tokenIds.increment();
        uint newItemId = _tokenIds.current();

        _mint(_msgSender(), newItemId);
        _setTokenURI(newItemId, _tokenURI);
        _setArtist(artist, newItemId);
        
        emit Mint(_msgSender(), newItemId, artist);
    }

    function burn(
        uint256 tokenId
        ) public virtual override(ERC721Burnable) {
        
        super.burn(tokenId);
    }

    function addMarketplace(
        address _marketplace
        ) external {
        
        require(
            hasRole(
                DEFAULT_ADMIN_ROLE, 
                _msgSender()
            ),
            "DeSpaceNFT: must have super admin role to update auction"
        );

        require(
            _marketplace != address(0),
            "DeSpaceNFT: must not input the null address"
        );

        require(
            !_markets[_marketplace],
            "DeSpaceNFT: market has already been added"
        );

        _markets[_marketplace] = true;

        emit MarketplaceAdded(_msgSender(), _marketplace);
    }

    function removeMarketplace(
        address _marketplace
        ) external {
        
        require(
            hasRole(
                DEFAULT_ADMIN_ROLE, 
                _msgSender()
            ),
            "DeSpaceNFT: must have super admin role to update auction"
        );

        require(
            _marketplace != address(0),
            "DeSpaceNFT: must not input the null address"
        );

        require(
            _markets[_marketplace],
            "DeSpaceNFT: market does not already exist"
        );

        _markets[_marketplace] = false;

        emit MarketplaceRemoved(_msgSender(), _marketplace);
    }

    function isMarketplace(
        address _marketplace
        ) external view returns(
            bool _isMarketplace
        ) {
        
        return _markets[_marketplace];
    }

    function isAdmin(
        address addr
        ) external view returns(
            bool _isAdmin
        ) {
        
        if(
            hasRole(
                DEFAULT_ADMIN_ROLE, 
                addr
            )

            || hasRole(
                ADMIN_ROLE, 
                addr
            )
        )
        return true;
        else return false;
    }

    function getArtist(
        uint tokenId
        ) external view returns(
            address artist
        ) {
        
        require(
            _exists(tokenId), 
            "ERC721: operator query for nonexistent token"
        );
        return _idToArtist[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
        ) public view
        override(
            AccessControlEnumerable, 
            ERC721, 
            ERC721Enumerable
        )
        returns (
            bool itSupports
        ) {

        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
        ) public view virtual override(
            ERC721URIStorage, 
            ERC721
        ) returns (string memory URI){
        
        return super.tokenURI(tokenId);
    }

    function _setArtist(
        address artist, 
        uint id
        ) internal {

        _idToArtist[id] = artist;
    }

    function _resetArtist(
        uint id
        ) internal {

        _idToArtist[id] = address(0);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
        ) internal override(
        ERC721, 
        ERC721Enumerable
        ) {
        
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _isApprovedOrOwner(
        address spender, 
        uint tokenId
        ) internal view virtual override(
            ERC721
        ) returns (
            bool isApproved
        ) {

        super._isApprovedOrOwner(spender, tokenId);
        
        require(
            _exists(tokenId), 
            "ERC721: operator query for nonexistent token"
        );
        
        address owner = ERC721.ownerOf(tokenId);
        
        return (
            spender == owner 
            || getApproved(tokenId) == spender 
            || isApprovedForAll(owner, spender)
            || _markets[spender] == true
        );
    }

    function _burn(
        uint256 tokenId
        ) internal virtual override(
            ERC721,
            ERC721URIStorage
        ) {
        
        _resetArtist(tokenId);
        _burn(tokenId);
    }
}
