// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract NiftifyERC20_old is ERC20Pausable, ERC20Permit, AccessControl {
  bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

  constructor(
    string memory name,
    string memory symbol,
    uint256 initialBalance
  ) ERC20(name, symbol) ERC20Permit(name) {
    _mint(msg.sender, initialBalance);
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(OPERATOR_ROLE, msg.sender);
  }

  function pause() external onlyOperator {
    _pause();
  }

  function unpause() external onlyOperator {
    _unpause();
  }

  function transferWithPermit(
    address recipient,
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    bytes memory signature
  ) external {
    bytes32 r;
    bytes32 s;
    uint8 v;
    assembly {
      r := mload(add(signature, 0x20))
      s := mload(add(signature, 0x40))
      v := byte(0, mload(add(signature, 0x60)))
    }

    ERC20Permit.permit(owner, spender, value, deadline, v, r, s);

    transferFrom(owner, recipient, value);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal virtual override(ERC20Pausable, ERC20) {
    ERC20Pausable._beforeTokenTransfer(from, to, amount);
  }

  modifier onlyOperator() {
    require(hasRole(OPERATOR_ROLE, msg.sender), "Caller is not operator");
    _;
  }
}
