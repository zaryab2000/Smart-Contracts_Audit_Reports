// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../Emiswap.sol";

contract FactoryMock is IFactory {
    uint256 private _fee;
    uint256 private _feeVault;
    address private _addressVault;

    function fee() external view override returns (uint256) {
        return _fee;
    }

    function feeVault() external view override returns (uint256) {
        return _feeVault;
    }

    function addressVault() external view override returns (address) {
        return _addressVault;
    }

    function setFee(uint256 newFee) external {
        _fee = newFee;
    }

    function setFeeVault(uint256 newFeeVault) external {
        _feeVault = newFeeVault;
    }

    function setaddressVault(address newAddressVault) external {
        _addressVault = newAddressVault;
    }
}

contract EmiswapMock is Emiswap {
    constructor(
        IERC20[] memory assets,
        string memory name,
        string memory symbol
    ) public Emiswap(assets, name, symbol) {
        factory = new FactoryMock();
    }
}
