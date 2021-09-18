pragma solidity 0.8.4;

// SPDX-License-Identifier: MIT

//import "./standard/token/ERC20/ERC20.sol";
import "./standard/access/AccessControl.sol";
import "./Token.sol";
import "./standard/access/AccessControl.sol";

contract ChildToken is AccessControl, Token {

    address public childChainManagerProxy;

    constructor(string memory name, string memory symbol, address childChainManagerProxy_) Token(name, symbol, 0)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        childChainManagerProxy = childChainManagerProxy_;
    }

    function updateChildChainManager(address newChildChainManagerProxy)
    external
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "ChildToken - updateChildChainManager: Caller is unauthorized.");
        require(newChildChainManagerProxy != address(0), "ChildToken - updateChildChainManager: Cannot set childChainManagerProxy to 0.");

        childChainManagerProxy = newChildChainManagerProxy;
    }

    function deposit(address user, bytes calldata depositData)
    external
    {
        require(msg.sender == childChainManagerProxy, "ChildToken - deposit : Caller is not childChainManagerProxy.");

        uint256 amount = abi.decode(depositData, (uint256));

        // `amount` token getting minted here & equal amount got locked in RootChainManager
        ERC20._mint(user, amount);
    }

    function withdraw(uint256 amount)
    external
    {
        ERC20._burn(msg.sender, amount);
    }

    function burn(uint256 amount)
    public override
    {
        revert("Burning can only be done on the main Ethereum network. Please transfer your tokens over and burn from there.");
    }
}

/**
  * CHILD TOKEN       - 51 Lines   
  * Competition.sol   - 739 Lines  
  * CompetitionStorage- 55 Lines    
  * MultiSig          - 437 Lines   
  * Registry          - 181 Lines  
  * Token             - 169 Lines  
***/