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
    constructor() public {
        factory = new FactoryMock();
    }

    /* function initialize(IERC20[] memory assets) public {
        require(msg.sender == address(factory), "Emiswap: FORBIDDEN"); // sufficient check
        require(assets.length == 2, "Emiswap: only 2 tokens allowed");
        
        tokens = assets;
        for (uint256 i = 0; i < assets.length; i++) {
            require(!isToken[assets[i]], "Emiswap: duplicate tokens");
            isToken[assets[i]] = true;
        }
    } */
}
