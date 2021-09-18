//"SPDX-License-Identifier: MIT"
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DesLinkRegistry is Ownable {

    //struct
    struct EthPair {
        string ticker;
        uint8 decimals;
        address proxy;
    }

    //token address to EthPair struct
    mapping(address => EthPair) private addressToEthPair;

    //events
    event ProxyAdded(
        address indexed owner, 
        address indexed token,
        string ticker,
        address proxy
    );

    event ProxyRemoved(
        address indexed owner, 
        address indexed token,
        string ticker,
        address proxy
    );

    /* 
     * @dev registers a new compliant token and its proxy (only owner).
     * NOTE must input the correct details to avoid errors in child contract.
     * ----------------------------------------------------------------------
     * errors if it already exists.
     * ---------------------------- 
     * @param _ticker --> the symbol of the token.
     * @param _token --> address of the token.
     * @param _decimals --> the correct decimal of _token.
     * @param _proxy --> the correct proxy address of the associated 
     * token provided by chainlink. see https://docs.chain.link/docs/ethereum-addresses/
     * ---------------------------------------------------------------------------------
     * returns whether successfully set or not.
     */ 
    function addProxy(
        string memory _ticker,
        address _token,
        uint8 _decimals,
        address _proxy
        ) external onlyOwner returns(bool added) {
        
        EthPair storage ethPair = addressToEthPair[_token];
        require(
            ethPair.proxy == address(0), 
            "Error: already exists"
        );
        
        ethPair.ticker = _ticker;
        ethPair.proxy = _proxy;
        ethPair.decimals = _decimals;

        emit ProxyAdded(msg.sender, _token, _ticker, _proxy);
        return true;
    }

    /* 
     * @dev removes a compliant token and its proxy (only owner).
     * ----------------------------------------------------------
     * errors if it doesn't exists.
     * ----------------------------
     * @param _token --> address of the token.
     * ---------------------------------------
     * returns whether successfully set or not.
     */ 
    function removeProxy(
        address _token
        ) external onlyOwner returns(bool removed) {
        
        EthPair storage ethPair = addressToEthPair[_token];
        require(
            ethPair.proxy != address(0), 
            "Error: does not exist"
        );

        string memory ticker = ethPair.ticker;
        address proxy = ethPair.proxy;

        delete addressToEthPair[_token];

        emit ProxyRemoved(msg.sender, _token, ticker, proxy);
        return true;
    }

    /* 
     * @dev get the chainlink proxy address and token decimals.
     * --------------------------------------------------------
     * @param _token --> the address of the token.
     * -------------------------------------------
     * returns the proxy address and token decimal.
     */
    function getProxy(
        address _token
        ) external view returns(address proxy, uint8 tokenDecimals) {
        
        return (
            addressToEthPair[_token].proxy,
            addressToEthPair[_token].decimals
        );
    }
} 