// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";

abstract contract ERC1155SupplyPausable is ERC1155Supply, ERC1155Pausable {
  function _mint(
    address account,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) internal virtual override(ERC1155, ERC1155Supply) {
    ERC1155Supply._mint(account, id, amount, data);
  }

  function _mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal virtual override(ERC1155, ERC1155Supply) {
    ERC1155Supply._mintBatch(to, ids, amounts, data);
  }

  function _burn(
    address account,
    uint256 id,
    uint256 amount
  ) internal virtual override(ERC1155, ERC1155Supply) {
    ERC1155Supply._burn(account, id, amount);
  }

  function _burnBatch(
    address account,
    uint256[] memory ids,
    uint256[] memory amounts
  ) internal virtual override(ERC1155, ERC1155Supply) {
    ERC1155Supply._burnBatch(account, ids, amounts);
  }

  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal virtual override(ERC1155, ERC1155Pausable) {
    ERC1155Pausable._beforeTokenTransfer(
      operator,
      from,
      to,
      ids,
      amounts,
      data
    );
  }
}
