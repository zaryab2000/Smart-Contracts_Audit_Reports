// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16 <0.8.0;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Oracle} from "./OracleInterface.sol";
import {Queue} from "./Queue.sol";
import {GEG} from "./GEG.sol";

/**
 * @title GEG.Finance's Deposit Contract
 * @notice Common code for deposits
 * @author GEG.Finance
 */
abstract contract Bankable is OwnableUpgradeable, ERC20Upgradeable {
    using SafeMathUpgradeable for uint256;

    struct Deposit {
        address payable client;
        bool active;
        bool claimed;
        bool autoRenewal;
        uint256 amount;
        uint256 accruedPeriods;
        uint256 created;
        // uint256 expiry;
    }
    mapping(uint256 => Deposit) public deposits;

    uint256 public depositIndex;
    uint256 public depositValue;
    uint256 public claimValue;
    uint256 public term;
    uint256 public fine;
    uint256 public interest;
    GEG public tokenContract;
    address public underlying;

    uint256 internal _interestPerPeriod;
    uint256 internal _interestPerPeriodInverted;
    uint256 internal counter;
    Queue internal claimQueue;
    Oracle internal currencyOracle;
    uint256 internal constant CLAIM_GAS = 10000;
    uint256 internal constant MIN_PERIOD = 300;

    event LogDeposit(
        address indexed _from,
        uint256 indexed _id,
        uint256 _value
    );
    event LogWithdrawal(
        address indexed _from,
        uint256 indexed _id,
        uint256 _value
    );
    event LogClaim(uint256 indexed _id, uint256 _value);
    event LogClaimSatisfied(uint256 indexed _id, uint256 _value);
    event LogAccruedInterest(
        address indexed _from,
        uint256 indexed _id,
        uint256 _value
    );
    event LogAutoRenewal(uint256 indexed _id, bool _isRenewal);

    /**
     * @notice Accrue interest for one deposit
     * @param _id of deposit to accrue
     */
    function accrueInterestOne(uint256 _id) external {
        _accrueInterest(_id);
    }

    /**
     * @notice Accrue interest for one deposit and update exchange rates
     * @dev Look at Oracle.setRateSigned() for more details
     * @param _id of deposit to accrue
     */
    function accrueInterestOneWithRates(
        uint256 _id,
        uint256 _amount,
        uint256 _ts,
        bytes calldata _sig
    ) external {
        bool success =
            currencyOracle.setRateSigned(underlying, _amount, _ts, _sig);
        require(success, "Failed to update rates");
        _accrueInterest(_id);
    }

    /**
     * @notice Accrue interest for all deposits
     */
    function accrueInterestAll() public {
        // Accrue interest for each deposit in loop
        for (uint256 i = 1; i < depositIndex; i++) {
            _accrueInterest(i);
        }
    }

    /**
     * @notice Items in claim queue
     * @return Queue length
     */
    function claimIndex() external view returns (uint256) {
        return claimQueue.length();
    }

    /**
     * @notice Contract owner
     * @dev For BEP20 compatibility
     * @return address of contract owner
     */
    function getOwner() external view returns (address) {
        return owner();
    }

    /**
     * @notice Set Deposit Auto Renewal Flag (true/false)
     * @param _id of deposit
     * @param _isRenewal new Auto Renewal bool value
     */
    function setAutoRenewal(uint256 _id, bool _isRenewal) public {
        Deposit storage _deposit = deposits[_id];

        // Only deposit owner could chage flag
        _isMsgSender(_deposit.client);

        if (_isRenewal) {
            _deposit.autoRenewal = _isRenewal;
        } else {
            // To save gas
            delete _deposit.autoRenewal;
        }

        emit LogAutoRenewal(_id, _isRenewal);
    }

    /**
     * @notice Change Exchange rate Oracle
     * @param _address of new Oracle
     */
    function setOracle(Oracle _address) public onlyOwner {
        currencyOracle = _address;
    }

    /**
     * @notice Autoincremented Deposit ID
     * @return Next ID
     */
    function getID() internal returns (uint256) {
        counter = counter.add(1);
        return counter;
    }

    /**
     * @notice Custom constructor
     * @param _name GToken name
     * @param _symbol GToken symbol
     * @param _term Deposit term in seconds
     * @param _interest Deposit interest in percents multiplied by 100 (5.67% -> _interest = 567)
     * @param _fine Fine on deposit in case of withdrawal before expiracy in percents (25%)
     * @param _tokenContract Reward token address
     * @param _currencyOracle Exchange rate Oracle address
     */
    function __init(
        string memory _name,
        string memory _symbol,
        uint256 _term,
        uint256 _interest,
        uint256 _fine,
        GEG _tokenContract,
        Oracle _currencyOracle
    ) internal initializer {
        OwnableUpgradeable.__Ownable_init();
        ERC20Upgradeable.__ERC20_init(_name, _symbol);

        require(_interest > 0, "Zero interest is not an option");
        claimQueue = new Queue();
        term = _term;
        interest = _interest;

        // We need reverted interest for optimized compund interest formula
        // FIXME 5 min period insted of 1 day
        _interestPerPeriod = (_interest * 1 ether) / (365 * 24 * 12 * 10000);
        _interestPerPeriodInverted = (365 * 10000 * 24 * 12) / interest;

        fine = _fine;
        tokenContract = _tokenContract;
        currencyOracle = _currencyOracle;
    }

    /**
     * @notice Check if deposit exists
     * @param _id of deposit
     */
    function _hasDeposit(uint256 _id) internal view {
        require(depositIndex > 0, "Deposits don't exist.");
        require(_id <= counter, "Deposit does not exist.");
    }

    /**
     * @notice Check if function called by deposit owner
     */
    function _isMsgSender(address _pretendent) internal view {
        require(_pretendent == msg.sender, "Owner missmatch.");
    }

    /**
     * @notice Stub for deposit amount
     * @dev should implement in inherited contracts
     * @return deposited amount
     */
    function _getValue(uint256) internal virtual returns (uint256) {
        return msg.value;
    }

    /**
     * @notice Deposit creation implementation
     * @param _amount of deposit
     * @param isRenewal is if interest could be claimed after deposit expiracy
     */
    function _makeDeposit(uint256 _amount, bool isRenewal) internal virtual {
        // Next ID
        uint256 id_ = getID();

        // allocate space in  storage for new deposit with default values
        Deposit storage deposit = deposits[id_];

        deposit.client = msg.sender;
        // Get deposited amount. For ERC20 it should invocate token transfer
        uint256 value = _getValue(_amount);

        // Change default value to distinguish active deposits and closed/deleted deposits
        deposit.active = true;

        if (isRenewal) {
            deposit.autoRenewal = isRenewal;
        }

        deposit.amount = value;
        deposit.created = block.timestamp;

        emit LogDeposit(msg.sender, id_, value);

        if (deposit.autoRenewal) {
            emit LogAutoRenewal(id_, true);
        }

        depositIndex = depositIndex.add(1);
        depositValue = depositValue.add(_amount);

        // mint GTokens
        _mint(msg.sender, value);
    }

    /**
     * @notice Apply fine if withdrawal is before deposit expiration
     * @param _amount of deposit
     * @param _expiry timestamp
     * @return new amount to withdrawal
     */
    function _applyFine(uint256 _amount, uint256 _expiry)
        internal
        view
        returns (uint256)
    {
        if (fine > 0 && _expiry > block.timestamp) {
            _amount = _amount.div(100).mul(100 - fine);
        }
        return _amount;
    }

    /**
     * @notice Proxy method to calculate interest
     * @param _amount of deposit
     * @param _periods to accrue interest
     * @return absolute interest value
     */
    function _calculateInterest(uint256 _amount, uint256 _periods)
        internal
        view
        returns (uint256)
    {
        return
            _compoundInterest(_amount, _interestPerPeriodInverted, _periods, 8);
    }

    /**
     * @notice Calculate compound interest in suboptimal way
     * @dev from stackoverflow
     * @param startBalance current deposit value
     * @param inverseRate inverted interest rate
     * @param n of periods
     * @param sigFigs after decimal point
     * @return absolute interest value
     */
    function _compoundInterest(
        uint256 startBalance,
        uint256 inverseRate,
        uint256 n,
        uint256 sigFigs
    ) internal pure returns (uint256) {
        uint256 _n = n;
        uint256 _b = 1;
        uint256 i = 1;
        uint256 taylorTerm = startBalance;
        uint256 s = taylorTerm;
        //for (uint i = 0; i < precision; ++i){
        while (taylorTerm > s / 10**sigFigs) {
            taylorTerm = (startBalance * _n) / _b / (inverseRate**i);
            _n = _n * (n - i);
            _b = _b * (i + 1);
            s += taylorTerm;
            i++;
        }
        return s - startBalance;
    }

    /**
     * @notice Calculate periods to accrue interest
     * @param _created deposin creation timestamp
     * @param _accruedPeriods already accrued
     * @param _isAutoRenewal AutoRenewal flag
     * @return n of periods to accrue
     */
    function _calculatePeriods(
        uint256 _created,
        uint256 _accruedPeriods,
        bool _isAutoRenewal
    ) internal view returns (uint256) {
        // expiration date is calculated
        uint256 expiry = _created + term;
        uint256 timeSinceCreated = block.timestamp - _created;

        // prevent claim before MIN_PERIOD sec passed since deposit created
        if (timeSinceCreated < MIN_PERIOD) {
            return 0;
        }

        uint256 periods_ = timeSinceCreated / MIN_PERIOD - _accruedPeriods;

        if (term > 0 && !_isAutoRenewal && expiry <= block.timestamp) {
            periods_ = (expiry - _created) / MIN_PERIOD - _accruedPeriods;
        }

        return periods_;
    }

    /**
     * @notice Accrue interest implementation
     * @param _id of deposit to accrue interest
     */
    function _accrueInterest(uint256 _id) internal virtual returns (bool) {
        Deposit storage _deposit = deposits[_id];
        require(_deposit.active, "Deposit is closed.");
        // variable to save gas on storage reading operations
        uint256 amount = _deposit.amount;
        uint256 created = _deposit.created;
        uint256 accruedPeriods = _deposit.accruedPeriods;
        address client = _deposit.client;

        uint256 periods_ =
            _calculatePeriods(created, accruedPeriods, _deposit.autoRenewal);
        // not enough time passed since last interest
        if (periods_ <= 0) {
            return false;
        }

        // convert ETH to reward token
        amount = currencyOracle.convert(underlying, amount);

        // calculate compound interest
        amount = _calculateInterest(amount, periods_);

        _deposit.accruedPeriods = accruedPeriods + periods_;

        emit LogAccruedInterest(client, _id, amount);
        tokenContract.transferFrom(owner(), client, amount);

        return true;
    }
}
