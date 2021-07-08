pragma solidity >=0.5.16 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title GEG.Finance's Token
 * @notice ERC20 Token
 * @author GEG.Finance
 */
contract GEG is Ownable, ERC20 {
    using SafeMath for uint256;

    /**
     * @notice Constructor
     * @param amount of emission
     */
    constructor(uint256 amount) public ERC20("GEG Token", "GEG") {
        _mint(msg.sender, amount);
    }

    /**
     * @notice Contract owner
     * @dev For BEP20 compatibility
     * @return address of contract owner
     */
    function getOwner() external view returns (address) {
        return owner();
    }
}
