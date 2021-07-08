// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16 <0.8.0;

/**
 * @title GEG.Finance's Oracle Interface
 * @author GEG.Finance
 */
interface Oracle {
    /**
     * @notice Set ETH to Reward token exchange rate
     * @param _amount of Reward coins per 1 ETH
     */
    function setETHrate(uint256 _amount) external;

    /**
     * @notice Convert ERC20 token to Reward token
     * @param _address of ERC20 token
     * @param _amount of ETH coins
     * @return amount of reward token
     */
    function convert(address _address, uint256 _amount)
        external
        view
        returns (uint256);

    /**
     * @notice Set ERC20 to Reward token exchange rate
     * @param _address of ERC20 token
     * @param _amount of Reward coins per 1 ERC20 token
     */
    function setRate(address _address, uint256 _amount) external;

    /**
     * @notice Set ETH/ERC20 to Reward token exchange rate on behalf of contract owner
     * @param _address of ERC20 token
     * @param _amount of Reward coins per 1 ERC20 token
     * @param _ts Timestamp of signature. Used to check if rate is newer than existing
     * @param _sig is message signature
     * @return True is rate was updated successfully
     */
    function setRateSigned(
        address _address,
        uint256 _amount,
        uint256 _ts,
        bytes calldata _sig
    ) external returns (bool);
}
