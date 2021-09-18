//"SPDX-License-Identifier: MIT"
pragma solidity 0.8.4;

interface DesLinkRegistryInterface {

    function addProxy(
        string calldata _ticker,
        address _token,
        address _proxy
        ) external returns(
            bool added
        );

    function removeProxy(
        address _token
        ) external returns(
            bool removed
        );

    function getProxy(
        address _token
        ) external view returns(
            address proxy, 
            uint8 tokenDecimals
        );
}