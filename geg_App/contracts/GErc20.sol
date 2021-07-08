pragma solidity 0.6.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Bankable} from "./Bank.sol";
import {GEG} from "./GEG.sol";
import {Oracle} from "./OracleInterface.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";

/**
 * @title GEG.Finance's GErc20 Contract
 * @notice GToken wraps an ERC20 token and contains ERC20 specific logic
 * @author GEG.Finance
 */
contract GErc20 is Bankable {
     using SafeMathUpgradeable for uint256;
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
     * @param _underlying ERC20 token address
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _term,
        uint256 _interest,
        uint256 _fine,
        GEG _tokenContract,
        Oracle _currencyOracle,
        address _underlying
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
        setUnderlying(_underlying);
    }

    /**
     * @notice Fallback
     */
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /**
     * @notice Make a deposit
     * @dev Should be called on Proxy deployment. Needs approve by user
     * @param _amount of ERC20 tokens to deposit. Need to pass amount because user approves GToken contract to transfer
     *  his ERC20 tokens
     * @param isRenewal means should user be allowed to claim interest(true) or not(false) after deposit expiration
     */
    function deposit(uint256 _amount, bool isRenewal) external {
        _makeDeposit(_amount, isRenewal);
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
        // require(_deposit.client == msg.sender, "Owner missmatch.");
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

        // transfer ERC20 tokens
        IERC20 token = IERC20(underlying);
        token.transfer(msg.sender, amount);
    }

    /**
     * @notice Withdraw contract ERC20 funds. Only owner
     * @param amount of funds to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        IERC20 token = IERC20(underlying);
        uint256 totalBalance = token.balanceOf(address(this));

        // Check if enough funds
        if (totalBalance > 0 && totalBalance >= amount && amount > 0) {
            token.transfer(msg.sender, amount);
        }
    }

    /**
     * @notice Donate ERC20 tokens to contract without deposit creation with following payout
     * @dev needs approve
     * @param _amount of tokens to donate
     */
    function donate(uint256 _amount) external payable {
        _getValue(_amount);
        _payout();
    }

    /**
     * @notice Change underlying ERC20 token to wrap
     */
    function setUnderlying(address _token) public onlyOwner {
        underlying = _token;
    }

    /**
     * @notice Transfer _amount of tokens on behalf of user
     * @dev has side effect - tranfer tokens. As opposed to ETH Contract
     * @param _amount of tokens to deposit/transfer
     * @return amount of transfered tokens
     */
    function _getValue(uint256 _amount) internal override returns (uint256) {
        IERC20 token = IERC20(underlying);

        token.transferFrom(msg.sender, address(this), _amount);

        return _amount;
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
        IERC20 token = IERC20(underlying);
        uint256 totalBalance = token.balanceOf(address(this));

        // If not enough funds for current withdrawal or any other claims exist
        // than add deposit to queue
        if (_amount > totalBalance || claimQueue.length() > 0) {
            emit LogClaim(_id, _amount);

            claimQueue.enqueue(_id);
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
        while (gasleft() > CLAIM_GAS && claimQueue.length() > 0) {
            // Check if we have enough funds to pay out next deposit in queue
            uint256 id = claimQueue.next();
            Deposit storage _deposit = deposits[id];
            uint256 amount = _deposit.amount;
            address client = _deposit.client;
            IERC20 token = IERC20(underlying);
            if (token.balanceOf(address(this)) < amount) {
                // Stop. Not enough funds
                return;
            }

            // Pop first deposit from queue
            id = claimQueue.dequeue();
            emit LogClaimSatisfied(id, amount);

            // reduce total amount to pay
            claimValue = claimValue.sub(amount);

            delete deposits[id];

            depositValue = depositValue.sub(amount);
            depositIndex = depositIndex.sub(1);

            // reduce total GToken supply
            _burn(client, amount);

            token.transfer(client, amount);
        }
    }
}
