// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract TokenStorage is AccessControl, IERC2981 {
  bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant REDEEMER_ROLE = keccak256("REDEEMER_ROLE");
  uint32 private constant _ROYALTY_SCALE = 100000000;

  mapping(uint256 => string) private _metadataHashes;
  mapping(uint256 => address) private _creators;
  mapping(uint256 => uint32) private _royalties;
  mapping(uint256 => bool) private _blocked;

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function metadataHash(uint256 _tokenId) public view returns (string memory) {
    if (blocked(_tokenId)) return "";
    return _metadataHashes[_tokenId];
  }

  function _setMetadataHash(uint256 _tokenId, string calldata _metadataHash)
    internal
    virtual
  {
    _metadataHashes[_tokenId] = _metadataHash;
  }

  function creator(uint256 _tokenId) public view returns (address) {
    return _creators[_tokenId];
  }

  function _setCreator(uint256 _tokenId, address _creator) internal virtual {
    _creators[_tokenId] = _creator;
  }

  function royalty(uint256 _tokenId) public view returns (uint32) {
    return _royalties[_tokenId];
  }

  function _setRoyalty(uint256 _tokenId, uint32 _royalty) internal virtual {
    require(_royalty <= _ROYALTY_SCALE);
    _royalties[_tokenId] = _royalty;
  }

  function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
    external
    view
    override
    returns (address receiver, uint256 royaltyAmount)
  {
    receiver = creator(_tokenId);
    royaltyAmount = mulScale(_salePrice, royalty(_tokenId), _ROYALTY_SCALE);

    return (receiver, royaltyAmount);
  }

  function blocked(uint256 _tokenId) public view returns (bool) {
    return _blocked[_tokenId];
  }

  function setBlocked(uint256 _tokenId, bool _value) external onlyOperator {
    _blocked[_tokenId] = _value;
  }

  function supportsInterface(bytes4 _interfaceId)
    public
    view
    virtual
    override(AccessControl, IERC165)
    returns (bool)
  {
    return
      _interfaceId == type(IERC2981).interfaceId ||
      AccessControl.supportsInterface(_interfaceId);
  }

  function mulScale(
    uint256 x,
    uint256 y,
    uint32 scale
  ) private pure returns (uint256) {
    uint256 a = x / scale;
    uint256 b = x % scale;
    uint256 c = y / scale;
    uint256 d = y % scale;

    return a * c * scale + a * d + b * c + (b * d) / scale;
  }

  modifier onlyOperator() {
    require(
      hasRole(OPERATOR_ROLE, msg.sender),
      "Caller does not have blocker role"
    );
    _;
  }

  modifier onlyAdmin() {
    require(
      hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
      "Caller does not have admin role"
    );
    _;
  }

  modifier onlyRedeemer() {
    require(
      hasRole(REDEEMER_ROLE, msg.sender),
      "Caller does not have redeemer role"
    );
    _;
  }
}
