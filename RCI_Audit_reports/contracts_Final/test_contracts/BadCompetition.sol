pragma solidity 0.8.4;
// SPDX-License-Identifier: MIT

import './../../interfaces/IToken.sol';

contract BadCompetition {
    IToken public token;
    uint256 public amount;

    constructor(address token_){
        token = IToken(token_);
    }

    function increaseStake(address staker, uint256 amountToken) external returns (bool success)
    {
        amount = amountToken;
        token.transfer(staker, amountToken/2);
        return true;
    }

    function decreaseStake(address staker, uint256 amountToken) external returns (bool success)
    {
        amount = amountToken;
        token.transfer(staker, amountToken/2);
        return true;
    }

    function getStake(address participant) view external returns (uint256 stake)
    {
        return amount;
    }

}
