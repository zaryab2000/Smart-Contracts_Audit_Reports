pragma solidity 0.8.4;
// SPDX-License-Identifier: MIT

import './../../interfaces/IToken.sol';
import './../../contracts/AccessControlRci.sol';
contract BadCompetition2{
    IToken public token;
    uint256 public amount;

    constructor(address token_){
        token = IToken(token_);
    }

    function increaseStake(address staker, uint256 amountToken) external returns (bool success)
    {
        amount = amountToken;
    }

    function decreaseStake(address staker, uint256 amountToken) external returns (bool success)
    {
        require(amountToken > 0);
        token.transfer(staker, amountToken);
        amount = amountToken;
    }
    
    function getStake(address participant) view external returns (uint256 stake)
    {
        return 1;
    }

}
