// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16 <0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
// import {Queue} from './Queue.sol';
import {Oracle} from "./OracleInterface.sol";
import {GEG} from "./GEG.sol";
import {Bankable} from "./Bank.sol";

/**
 * @title GEG.Finance's GEther Contract
 * @notice GToken wraps an ETH and contains ETH specific deposit logic
 * @author GEG.Finance
 */
contract GEther is Bankable {
    /**
     * @notice Initializer for upgradable contract
     * @dev Should be called on Proxy deployment
     * @param _name GToken name
     * @param _symbol GToken symbol
     * @param _term Deposit term in seconds
     * @param _interest Deposit interest in percents multiplied by 100 (5.67% -> _interest = 567)
     * @param _fine Fine on deposit in case of withdrawal before expiracy
     * @param _tokenContract Reward token address
     * @param _currencyOracle Exchange rate Oracle address
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _term,
        uint256 _interest,
        uint256 _fine,
        GEG _tokenContract,
        Oracle _currencyOracle
    ) public initializer {
        Bankable.__init(
            _name,
            _symbol,
            _term,
            _interest,
            _fine,
            _tokenContract,
            _currencyOracle
        );
        // mock ETH as token
        underlying = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    }

    /**
     * @notice Make deposit by transfering ETH. By default deposit is not autorenewable
     */
    receive() external payable {
        _makeDeposit(msg.value, false);
    }

    /**
     * @notice Make a deposit
     * @dev Should be called on Proxy deployment
     * @param isRenewal means should user be allowed to claim interest(true) or not(false) after deposit expiration
     */
    function deposit(bool isRenewal) external payable {
        _makeDeposit(msg.value, isRenewal);
    }

    /**
     * @notice Make a withdrawal of deposit. Partitial withdrawal is not allowed
     * @param id of deposit
     */
    function makeWithdrawal(uint256 id) external {
        _hasDeposit(id);

        Deposit storage _deposit = deposits[id];
        require(_deposit.active == true, "Deposit is closed.");
        _isMsgSender(_deposit.client);
        require(_deposit.claimed == false, "Deposit is already claimed.");

        // New variable to save some gas
        uint256 depositAmount = _deposit.amount;

        // Expire date is always calculated from creation date to save gas on storage
        uint256 expiry = _deposit.created + term;

        // Check if whole deposit amount should be returned to user
        uint256 amount = _applyFine(depositAmount, expiry);

        // Accrue interest
        _accrueInterest(id);

        // Check if Contract balance is enough to withdraw
        if (_claim(id, amount)) {
            return;
        }

        emit LogWithdrawal(msg.sender, id, amount);
        // refund gas
        delete deposits[id];

        depositValue = depositValue.sub(depositAmount);
        depositIndex = depositIndex.sub(1);

        // reduce total supply
        _burn(msg.sender, depositAmount);

        // transfer ETH
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed3.");
    }

    /**
     * @notice Donate ETH to contract without deposit creation with following payout
     */
    function donate() external payable {
        // Pay out claimed deposits
        _payout();
    }

    /**
     * @notice Withdraw contract ETH funds. Only owner
     * @param amount of funds to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        // Check if enough funds
        if (
            address(this).balance > 0 &&
            address(this).balance >= amount &&
            amount > 0
        ) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Transfer failed.");
        }
    }

    /**
     * @notice Get deposited amount from msg
     * @dev return transfered ETH. _amount is not used
     * @return amount in Wei
     */
    function _getValue(uint256) internal override returns (uint256) {
        return msg.value;
    }

    /**
     * @notice Call deposit creation and try to payout all claimed deposits
     * @param _amount of deposit
     * @param isRenewal is if interest could be claimed after deposit expiracy
     */
    function _makeDeposit(uint256 _amount, bool isRenewal) internal override {
        Bankable._makeDeposit(_amount, isRenewal);

        /// If there are any claimed deposits than new deposit funds are used to
        /// pay out claimed in FIFO order
        _payout();
    }

    /**
     * @notice Claim deposit payout if not enough funds to make withdrawal
     * @param _id of deposit to withdraw
     * @param _amount to withdraw
     */
    function _claim(uint256 _id, uint256 _amount) internal returns (bool) {
        // If not enough funds for current withdrawal or any other claims exist
        // than add deposit to queue
        if (_amount > address(this).balance || claimQueue.length() > 0) {
            emit LogClaim(_id, _amount);

            claimQueue.enqueue((_id));
            claimValue = claimValue.add(_amount);

            deposits[_id].claimed = true;

            return true;
        }

        // It's ok to make deposit withdrawal right now
        return false;
    }

    /**
     * @notice Pay out claimed deposits
     */
    function _payout() internal {
        // While gas left is enough to close one contract and any deposit queue:
        while (claimQueue.length() > 0 && gasleft() > CLAIM_GAS) {
            // Check if we have enough funds to pay out next deposit in queue
            uint256 id = claimQueue.next();
            Deposit storage _deposit = deposits[id];
            uint256 amount = _deposit.amount;
            address client = _deposit.client;
            if (address(this).balance < amount) {
                // Stop. Not enough funds
                return;
            }

            // Pop first deposit from queue
            id = claimQueue.dequeue();
            emit LogClaimSatisfied(id, amount);

            // reduce total amount to pay
            claimValue = claimValue.sub(amount);

            // free up gas
            delete deposits[id];

            depositValue = depositValue.sub(amount);
            depositIndex = depositIndex.sub(1);

            // reduce total GToken supply
            _burn(client, amount);

            (bool success, ) = client.call{value: amount}("");
            require(success, "Transfer failed.");
        }
    }
}
