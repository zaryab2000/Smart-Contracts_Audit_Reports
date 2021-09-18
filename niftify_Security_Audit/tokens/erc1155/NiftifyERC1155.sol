// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./ERC1155SupplyPausable.sol";
import "../NiftifyNFTVouchers.sol";
import "../TokenStorage.sol";

contract NiftifyERC1155 is
  ERC1155SupplyPausable,
  NiftifyNFTVouchers,
  TokenStorage
{
  string private constant URI_ = "https://niftify.io/nft/{id}.json";

  constructor() ERC1155(URI_) {}

  function redeem(ERC1155Voucher calldata _voucher) external onlyRedeemer {
    require(!paused(), "NiftifyERC1155: token minting while paused");
    // make sure signature is valid and get the address of the signer
    address signer = _verifyERC1155Voucher(_voucher);

    bool _tokenExists = exists(_voucher.tokenId);

    // first assign the token to the signer, to establish provenance on-chain
    _mint(signer, _voucher.tokenId, _voucher.amount, "");
    _safeTransferFrom(
      signer,
      msg.sender,
      _voucher.tokenId,
      _voucher.amount,
      ""
    );

    // only set data if token hasn't been minted before
    if (!_tokenExists) {
      // set data to token storage
      _setMetadataHash(_voucher.tokenId, _voucher.metadataHash);
      _setCreator(_voucher.tokenId, signer);
      _setRoyalty(_voucher.tokenId, _voucher.royalty);
    }
  }

  function mint(ERC1155Voucher calldata _voucher) public {
    require(!paused(), "NiftifyERC1155: token minting while paused");
    require(
      hasRole(MINTER_ROLE, _verifyERC1155Voucher(_voucher)),
      "Minter must sign this transaction"
    );

    bool _tokenExists = exists(_voucher.tokenId);
    _mint(msg.sender, _voucher.tokenId, _voucher.amount, "");

    if (!_tokenExists) {
      _setMetadataHash(_voucher.tokenId, _voucher.metadataHash);
      _setCreator(_voucher.tokenId, msg.sender);
      _setRoyalty(_voucher.tokenId, _voucher.royalty);
    }
  }

  function mintAndTransfer(ERC1155Voucher calldata _voucher, address _receiver)
    external
  {
    mint(_voucher);

    _safeTransferFrom(
      msg.sender,
      _receiver,
      _voucher.tokenId,
      _voucher.amount,
      ""
    );
  }

  function updateMetadataHash(UpdateMetadataHashVoucher calldata _voucher)
    external
  {
    require(
      !blocked(_voucher.tokenId),
      "Cannot update metadataHash of blocked token"
    );

    require(
      totalSupply(_voucher.tokenId) == 1,
      "Cannot update hash of token with supply more than 1"
    );

    (
      address _creator,
      address _owner,
      address _operator
    ) = _verifyUpdateMetadataHashVoucher(_voucher);

    require(
      hasRole(OPERATOR_ROLE, _operator) &&
        _creator == creator(_voucher.tokenId) &&
        balanceOf(_owner, _voucher.tokenId) == 1,
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
    override(TokenStorage, ERC1155)
    returns (bool)
  {
    return
      ERC1155.supportsInterface(_interfaceId) ||
      TokenStorage.supportsInterface(_interfaceId);
  }
}
