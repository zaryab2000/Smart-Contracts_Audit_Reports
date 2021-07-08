// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {AggregatorV3Interface} from '../Oracle/AggregatorV3Interface.sol';

contract MockChainlinkAggregatorV3 is AggregatorV3Interface {
    uint256 latestPrice = 1e8;

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (_roundId, int256(latestPrice), 1, 1, 1);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, int256(latestPrice), 1, 1, 1);
    }

    function decimals() external pure override returns (uint8) {
        return 8;
    }

    function description() external pure override returns (string memory) {
        return 'This is a mock chainlink oracle';
    }

    function version() external pure override returns (uint256) {
        return 3;
    }

    function setLatestPrice(uint256 price) public {
        latestPrice = price;
    }
}
