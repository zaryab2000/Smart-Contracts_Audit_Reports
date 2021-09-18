// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract NiftifyNFTVouchers is EIP712 {
  string private constant SIGNING_DOMAIN = "Niftify";
  string private constant SIGNATURE_VERSION = "1";

  mapping(bytes => bool) private _usedVouchers;

  constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

  struct ERC721Voucher {
    uint256 tokenId;
    string metadataHash;
    uint32 royalty;
    string uri;
    bytes signature;
  }

  struct ERC1155Voucher {
    uint256 tokenId;
    string metadataHash;
    uint32 royalty;
    uint256 amount;
    uint256 nonce;
    bytes signature;
  }

  struct UpdateMetadataHashVoucher {
    uint256 tokenId;
    string metadataHash;
    uint256 nonce;
    bytes creatorSignature;
    bytes ownerSignature;
    bytes operatorSignature;
  }

  // no need to check if voucher used -> ERC721 cannot have duplicate tokenId
  function _verifyERC721Voucher(ERC721Voucher calldata _voucher)
    internal
    view
    returns (address signer)
  {
    bytes32 digest = _hashTypedDataV4(
      keccak256(
        abi.encode(
          keccak256(
            "ERC721Voucher(uint256 tokenId,string metadataHash,uint32 royalty,string uri)"
          ),
          _voucher.tokenId,
          keccak256(bytes(_voucher.metadataHash)),
          _voucher.royalty,
          keccak256(bytes(_voucher.uri))
        )
      )
    );

    return ECDSA.recover(digest, _voucher.signature);
  }

  function _verifyERC1155Voucher(ERC1155Voucher calldata _voucher)
    internal
    checkIfUsedAndMarkAsUsed(_voucher.signature)
    returns (address signer)
  {
    bytes32 digest = _hashTypedDataV4(
      keccak256(
        abi.encode(
          keccak256(
            "ERC1155Voucher(uint256 tokenId,string metadataHash,uint32 royalty,uint256 amount,uint256 nonce)"
          ),
          _voucher.tokenId,
          keccak256(bytes(_voucher.metadataHash)),
          _voucher.royalty,
          _voucher.amount,
          _voucher.nonce
        )
      )
    );

    return ECDSA.recover(digest, _voucher.signature);
  }

  function _verifyUpdateMetadataHashVoucher(
    UpdateMetadataHashVoucher calldata _voucher
  )
    internal
    checkIfUsedAndMarkAsUsed(_voucher.creatorSignature)
    checkIfUsedAndMarkAsUsed(_voucher.ownerSignature)
    checkIfUsedAndMarkAsUsed(_voucher.operatorSignature)
    returns (
      address creator,
      address owner,
      address operator
    )
  {
    bytes32 digest = _hashTypedDataV4(
      keccak256(
        abi.encode(
          keccak256(
            "UpdateMetadataHashVoucher(uint256 tokenId,string metadataHash,uint256 nonce)"
          ),
          _voucher.tokenId,
          keccak256(bytes(_voucher.metadataHash)),
          _voucher.nonce
        )
      )
    );

    return (
      ECDSA.recover(digest, _voucher.creatorSignature),
      ECDSA.recover(digest, _voucher.ownerSignature),
      ECDSA.recover(digest, _voucher.operatorSignature)
    );
  }

  modifier checkIfUsedAndMarkAsUsed(bytes calldata _signature) {
    require(!_usedVouchers[_signature], "Voucher already used");
    _;
    _usedVouchers[_signature] = true;
  }
}
