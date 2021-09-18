// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./ERC721URIStoragePausable.sol";
import "../NiftifyNFTVouchers.sol";
import "../TokenStorage.sol";

contract NiftifyERC721 is
  ERC721URIStoragePausable,
  NiftifyNFTVouchers,
  TokenStorage
{
  string private constant TOKEN_NAME = "Niftify";
  string private constant TOKEN_SYMBOL = "NIFT";

  constructor() ERC721(TOKEN_NAME, TOKEN_SYMBOL) {}

  function redeem(ERC721Voucher calldata _voucher) external onlyRedeemer {
    require(!paused(), "NiftifyERC721: token minting while paused");
    // make sure signature is valid and get the address of the signer
    address signer = _verifyERC721Voucher(_voucher);

    // first assign the token to the signer, to establish provenance on-chain
    _mint(signer, _voucher.tokenId);
    _setTokenURI(_voucher.tokenId, _voucher.uri);

    _transfer(signer, msg.sender, _voucher.tokenId);

    // set data to token storage
    _setMetadataHash(_voucher.tokenId, _voucher.metadataHash);
    _setCreator(_voucher.tokenId, signer);
    _setRoyalty(_voucher.tokenId, _voucher.royalty);
  }

  function mint(ERC721Voucher calldata _voucher) public {
    require(!paused(), "NiftifyERC721: token minting while paused");
    require(
      hasRole(MINTER_ROLE, _verifyERC721Voucher(_voucher)),
      "Minter must sign this transaction"
    );

    _mint(msg.sender, _voucher.tokenId);
    _setTokenURI(_voucher.tokenId, _voucher.uri);
    _setMetadataHash(_voucher.tokenId, _voucher.metadataHash);
    _setCreator(_voucher.tokenId, msg.sender);
    _setRoyalty(_voucher.tokenId, _voucher.royalty);
  }

  function mintAndTransfer(ERC721Voucher calldata _voucher, address _receiver)
    external
  {
    mint(_voucher);

    _transfer(msg.sender, _receiver, _voucher.tokenId);
  }

  function updateMetadataHash(UpdateMetadataHashVoucher calldata _voucher)
    external
  {
    require(
      !blocked(_voucher.tokenId),
      "Cannot update metadataHash of blocked token"
    );

    (
      address _creator,
      address _owner,
      address _operator
    ) = _verifyUpdateMetadataHashVoucher(_voucher);

    require(
      hasRole(OPERATOR_ROLE, _operator) &&
        _creator == creator(_voucher.tokenId) &&
        _owner == ownerOf(_voucher.tokenId),
      "Invalid or unauthorized voucher"
    );

    _setMetadataHash(_voucher.tokenId, _voucher.metadataHash);
  }

  function pause() external onlyAdmin {
    _pause();
  }

  function unpause() external onlyAdmin {
    _unpause();
  }

  function supportsInterface(bytes4 _interfaceId)
    public
    view
    virtual
    override(TokenStorage, ERC721)
    returns (bool)
  {
    return
      ERC721.supportsInterface(_interfaceId) ||
      TokenStorage.supportsInterface(_interfaceId);
  }
}
