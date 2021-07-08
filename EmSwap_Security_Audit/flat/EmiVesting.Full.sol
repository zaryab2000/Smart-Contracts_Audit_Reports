// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

 // SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.2;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// File: @openzeppelin/contracts/math/SafeMath.sol
 

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        uint256 c = a + b;
        if (c < a) return (false, 0);
        return (true, c);
    }

    /**
     * @dev Returns the substraction of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        if (b > a) return (false, 0);
        return (true, a - b);
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) return (true, 0);
        uint256 c = a * b;
        if (c / a != b) return (false, 0);
        return (true, c);
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        if (b == 0) return (false, 0);
        return (true, a / b);
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        if (b == 0) return (false, 0);
        return (true, a % b);
    }

    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: modulo by zero");
        return a % b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {trySub}.
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        return a - b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryDiv}.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting with custom message when dividing by zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryMod}.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        return a % b;
    }
}

// File: @openzeppelin/contracts/utils/Address.sol

 
/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain`call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
      return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: value }(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

// File: @openzeppelin/contracts/token/ERC20/SafeERC20.sol

 



/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        // solhint-disable-next-line max-line-length
        require((value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(value);
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

// File: @openzeppelin/contracts/proxy/Initializable.sol

 
/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since a proxied contract can't have a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {UpgradeableProxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 */
abstract contract Initializable {

    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializer() {
        require(_initializing || _isConstructor() || !_initialized, "Initializable: contract is already initialized");

        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
        }
    }

    /// @dev Returns true if and only if the function is running in the constructor
    function _isConstructor() private view returns (bool) {
        return !Address.isContract(address(this));
    }
}

// File: contracts/interfaces/IEmiVesting.sol
 
/*************************************************************************
 *    EmiVesting inerface
 *
 ************************************************************************/
interface IEmiVesting {
    function balanceOf(address beneficiary) external view returns (uint256);

    function getCrowdsaleLimit() external view returns (uint256);
}

// File: contracts/interfaces/IESW.sol

 

/**
 * @dev Interface of the DAO token.
 */
interface IESW {
    function name() external returns (string memory);

    function symbol() external returns (string memory);

    function decimals() external returns (uint8);

    function balanceOf(address account) external view returns (uint256);

    function mintClaimed(address recipient, uint256 amount) external;

    function burn(uint256 amount) external;

    function burnFromVesting(uint256 amount) external;
}

// File: contracts/interfaces/IERC20Detailed.sol
 
 // * @dev Interface of the DAO token.
 // */
interface IERC20Detailed {
    function name() external returns (string memory);

    function symbol() external returns (string memory);

    function decimals() external returns (uint8);

    function mint(address account, uint256 amount) external;
}

// File: contracts/libraries/Priviledgeable.sol

 

abstract contract Priviledgeable {
    using SafeMath for uint256;
    using SafeMath for uint256;

    event PriviledgeGranted(address indexed admin);
    event PriviledgeRevoked(address indexed admin);

    modifier onlyAdmin() {
        require(
            _priviledgeTable[msg.sender],
            "Priviledgeable: caller is not the owner"
        );
        _;
    }

    mapping(address => bool) private _priviledgeTable;

    constructor() internal {
        _priviledgeTable[msg.sender] = true;
    }

    function addAdmin(address _admin) external onlyAdmin returns (bool) {
        require(_admin != address(0), "Admin address cannot be 0");
        return _addAdmin(_admin);
    }

    function removeAdmin(address _admin) external onlyAdmin returns (bool) {
        require(_admin != address(0), "Admin address cannot be 0");
        _priviledgeTable[_admin] = false;
        emit PriviledgeRevoked(_admin);

        return true;
    }

    function isAdmin(address _who) external view returns (bool) {
        return _priviledgeTable[_who];
    }

    //-----------
    // internals
    //-----------
    function _addAdmin(address _admin) internal returns (bool) {
        _priviledgeTable[_admin] = true;
        emit PriviledgeGranted(_admin);
    }
}

// File: contracts/EmiVesting.sol

 


contract EmiVesting is Initializable, Priviledgeable, IEmiVesting {
    using SafeMath for uint256;
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    //-----------------------------------------------------------------------------------
    // Data Structures
    //-----------------------------------------------------------------------------------
    uint32 constant QUARTER = 3 * 43776 minutes; // 3 months of 30.4 days in seconds;
    uint256 constant WEEK = 7 days;
    uint256 constant CROWDSALE_LIMIT = 40000000e18; // tokens
    uint256 constant CATEGORY_COUNT = 12; // Maximum category count
    uint32 constant VIRTUAL_MASK = 0x80000000;
    uint32 constant PERIODS_MASK = 0x0000FFFF;

    struct LockRecord {
        uint256 amountLocked; // Amount of locked tokens in total
        uint32 periodsLocked; // Number of periods locked in total and withdrawn: withdrawn << 16 + total
        uint32 periodLength; // Length of the period
        uint32 freezeTime; // Time when tokens were frozen
        uint32 category; // High bit of category means that its virtual tokens
    }

    struct CategoryRecord {
        uint256 tokensAcquired;
        uint256 tokensMinted;
        uint256 tokensAvailableToMint;
    }

    event TokensLocked(address indexed beneficiary, uint256 amount);
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event TokenChanged(address indexed oldToken, address indexed newToken);

    //-----------------------------------------------------------------------------------
    // Variables, Instances, Mappings
    //-----------------------------------------------------------------------------------
    /* Real beneficiary address is a param to this mapping */
    mapping(address => LockRecord[]) private _locksTable;
    mapping(address => CategoryRecord[CATEGORY_COUNT]) private _statsTable;

    address public _token;
    uint256 public version;
    uint256 public currentCrowdsaleLimit;

    // !!!In updates to contracts set new variables strictly below this line!!!
    //-----------------------------------------------------------------------------------
 string public codeVersion = "EmiVesting v1.0-138-g57c48e2";

    //-----------------------------------------------------------------------------------
    // Smart contract Constructor
    //-----------------------------------------------------------------------------------
    function initialize(address _ESW) public initializer {
        require(_ESW != address(0), "Token address cannot be empty");
        _token = _ESW;
        currentCrowdsaleLimit = CROWDSALE_LIMIT;
        _addAdmin(msg.sender);
        _addAdmin(_ESW);
    }

    //-----------------------------------------------------------------------------------
    // Observers
    //-----------------------------------------------------------------------------------
    // Return unlock date and amount of given lock
    function getLock(address beneficiary, uint32 idx)
        external
        view
        onlyAdmin
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        require(
            beneficiary != address(0),
            "Beneficiary should not be zero address"
        );
        require(
            idx < _locksTable[beneficiary].length,
            "Lock index is out of range"
        );

        return _getLock(beneficiary, idx);
    }

    function getLocksLen(address beneficiary)
        external
        view
        onlyAdmin
        returns (uint256)
    {
        require(
            beneficiary != address(0),
            "Beneficiary should not be zero address"
        );

        return _locksTable[beneficiary].length;
    }

    function getStats(address beneficiary, uint32 category)
        external
        view
        onlyAdmin
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        require(
            beneficiary != address(0),
            "Beneficiary should not be zero address"
        );
        require(category < CATEGORY_COUNT, "Wrong category idx");

        return (
            _statsTable[beneficiary][category].tokensAcquired,
            _statsTable[beneficiary][category].tokensMinted,
            _statsTable[beneficiary][category].tokensAvailableToMint
        );
    }

    //-----------------------------------------------------------------------------------
    // Observers
    //-----------------------------------------------------------------------------------
    // Return closest unlock date and amount
    function getNextUnlock() external view returns (uint256, uint256) {
        uint256 lockAmount = 0;
        uint256 unlockTime = 0;
        LockRecord[] memory locks = _locksTable[msg.sender];

        for (uint256 i = 0; i < locks.length; i++) {
            uint32 periodsWithdrawn = locks[i].periodsLocked >> 16;
            uint32 periodsTotal = locks[i].periodsLocked & PERIODS_MASK;

            for (uint256 j = periodsWithdrawn; j < periodsTotal; j++) {
                if (
                    locks[i].freezeTime + locks[i].periodLength * (j + 1) >=
                    block.timestamp
                ) {
                    if (unlockTime == 0) {
                        unlockTime =
                            locks[i].freezeTime +
                            locks[i].periodLength *
                            (j + 1);
                        lockAmount = locks[i].amountLocked / periodsTotal;
                    } else {
                        if (
                            unlockTime >
                            locks[i].freezeTime +
                                locks[i].periodLength *
                                (j + 1)
                        ) {
                            unlockTime =
                                locks[i].freezeTime +
                                locks[i].periodLength *
                                (j + 1);
                            lockAmount = locks[i].amountLocked / periodsTotal;
                        }
                    }
                }
            }
        }
        return (unlockTime, lockAmount);
    }

    function getMyLock(uint256 idx)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        require(
            idx < _locksTable[msg.sender].length,
            "Lock index is out of range"
        );

        return _getLock(msg.sender, uint32(idx));
    }

    function getMyLocksLen() external view returns (uint256) {
        return _locksTable[msg.sender].length;
    }

    function getMyStats(uint256 category)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        require(category < CATEGORY_COUNT, "Wrong category idx");

        return (
            _statsTable[msg.sender][category].tokensAcquired,
            _statsTable[msg.sender][category].tokensMinted,
            _statsTable[msg.sender][category].tokensAvailableToMint
        );
    }

    function unlockedBalanceOf(address beneficiary)
        external
        view
        returns (uint256)
    {
        require(beneficiary != address(0), "Address should not be zero");
        (uint256 _totalBalanceReal, uint256 _lockedBalanceReal) =
            _getBalance(beneficiary, false);
        (uint256 _totalBalanceVirt, uint256 _lockedBalanceVirt) =
            _getBalance(beneficiary, true);

        return
            _totalBalanceReal +
            _totalBalanceVirt -
            _lockedBalanceReal -
            _lockedBalanceVirt;
    }

    function balanceOf(address beneficiary)
        external
        view
        override
        returns (uint256)
    {
        require(beneficiary != address(0), "Address should not be zero");
        (uint256 _totalBalanceReal, ) = _getBalance(beneficiary, false);
        (uint256 _totalBalanceVirt, ) = _getBalance(beneficiary, true);

        return _totalBalanceReal + _totalBalanceVirt;
    }

    function balanceOfVirtual(address beneficiary)
        external
        view
        returns (uint256)
    {
        require(beneficiary != address(0), "Address should not be zero");

        (uint256 _totalBalanceVirt, ) = _getBalance(beneficiary, true);

        return _totalBalanceVirt;
    }

    function getCrowdsaleLimit() external view override returns (uint256) {
        return currentCrowdsaleLimit;
    }

    function claim() external returns (bool) {
        (uint256 _totalBalance, uint256 _lockedBalance) =
            _getBalance(msg.sender, false);

        uint256 tokensAvailable = _totalBalance - _lockedBalance;
        require(tokensAvailable > 0, "No unlocked tokens available");

        LockRecord[] memory addressLock = _locksTable[msg.sender];

        for (uint256 i = 0; i < addressLock.length; i++) {
            if (!_isVirtual(addressLock[i].category)) {
                // not virtual tokens, claim
                uint32 periodsWithdrawn = addressLock[i].periodsLocked >> 16;
                uint32 periodsTotal =
                    addressLock[i].periodsLocked & PERIODS_MASK;
                uint32 newPeriods = 0;
                for (uint256 j = periodsWithdrawn; j < periodsTotal; j++) {
                    if (
                        addressLock[i].freezeTime +
                            addressLock[i].periodLength *
                            (j + 1) <
                        block.timestamp
                    ) {
                        newPeriods++;
                    }
                }
                if (newPeriods > 0) {
                    _locksTable[msg.sender][i].periodsLocked =
                        ((periodsWithdrawn + newPeriods) << 16) +
                        periodsTotal;
                }
            }
        }

        emit TokensClaimed(msg.sender, tokensAvailable);

        return IERC20(_token).transfer(msg.sender, tokensAvailable);
    }

    function mint() external {
        // get virtual balance
        (uint256 _totalBalanceVirt, ) = _getBalance(msg.sender, true);
        require(_totalBalanceVirt > 0, "No virtual tokens available");
        // update locks
        LockRecord[] memory addressLock = _locksTable[msg.sender];

        for (uint256 i = 0; i < addressLock.length; i++) {
            if (_isVirtual(addressLock[i].category)) {
                uint32 cat = addressLock[i].category & ~VIRTUAL_MASK;
                uint256 amt = addressLock[i].amountLocked;
                _locksTable[msg.sender][i].category = cat;

                // mint tokens to vesting address
                IESW(_token).mintClaimed(address(this), amt);

                _statsTable[msg.sender][cat].tokensAvailableToMint -= amt;
                _statsTable[msg.sender][cat].tokensMinted += amt;
            }
        }
    }

    function burn() public onlyAdmin {
        uint256 bal = IESW(_token).balanceOf(address(this));
        IESW(_token).burnFromVesting(bal);
    }

    function burnLock(address _beneficiary, uint256 idx) public onlyAdmin {
        require(_beneficiary != address(0), "Address should not be zero");
        require(idx < _locksTable[_beneficiary].length, "Wrong lock index");

        _burnLock(_beneficiary, idx);
    }

    function burnAddress(address _beneficiary)
        external
        onlyAdmin
        returns (bool)
    {
        require(_beneficiary != address(0), "Address should not be zero");

        for (uint256 j = 0; j < _locksTable[_beneficiary].length; j++) {
            _burnLock(_beneficiary, j);
        }
    }

    //-----------------------------------------------------------------------------------
    // Locks manipulation
    //-----------------------------------------------------------------------------------
    function _burnLock(address _beneficiary, uint256 idx) internal {
        LockRecord storage lrec = _locksTable[_beneficiary][idx];

        if (!_isVirtual(lrec.category)) {
            // burn only non-virtual tokens
            uint32 periodsWithdrawn = lrec.periodsLocked >> 16;
            uint32 periodsTotal = lrec.periodsLocked & PERIODS_MASK;
            uint256 periodAmount = lrec.amountLocked / periodsTotal;

            uint256 totalBalance =
                lrec.amountLocked - (periodAmount * periodsWithdrawn);
            IESW(_token).burnFromVesting(totalBalance);
        }
        delete _locksTable[_beneficiary][idx];
    }

    function _freeze(
        address _beneficiary,
        uint32 _freezetime,
        uint256 _tokens,
        uint32 category,
        bool isVirtual,
        bool updateCS
    ) internal {
        uint32 cat = (isVirtual) ? category | VIRTUAL_MASK : category;
        LockRecord memory l =
            LockRecord({
                amountLocked: _tokens,
                periodsLocked: 4,
                periodLength: QUARTER,
                freezeTime: _freezetime,
                category: cat
            });

        if (updateCS) {
            require(
                currentCrowdsaleLimit >= _tokens,
                "EmiVesting: crowdsale limit exceeded"
            );
            currentCrowdsaleLimit = currentCrowdsaleLimit.sub(_tokens);
        }
        _locksTable[_beneficiary].push(l);
    }

    function _freezeWithRollup(
        address _beneficiary,
        uint32 _freezetime,
        uint256 _tokens,
        uint32 category,
        bool isVirtual,
        bool updateCS
    ) internal {
        LockRecord[] storage lrec = _locksTable[_beneficiary];
        bool recordFound = false;

        for (uint256 j = 0; j < lrec.length; j++) {
            if (
                lrec[j].freezeTime == _freezetime &&
                (lrec[j].category & ~VIRTUAL_MASK) == category
            ) {
                recordFound = true;
                lrec[j].amountLocked += _tokens;
                if (updateCS) {
                    require(
                        currentCrowdsaleLimit >= _tokens,
                        "EmiVesting: crowdsale limit exceeded"
                    );
                    currentCrowdsaleLimit = currentCrowdsaleLimit.sub(_tokens);
                }
            }
        }
        if (!recordFound) {
            // no record found, create new
            _freeze(
                _beneficiary,
                _freezetime,
                _tokens,
                category,
                isVirtual,
                updateCS
            );
        }
    }

    function _getBalance(address beneficiary, bool isVirtual)
        internal
        view
        returns (uint256, uint256)
    {
        LockRecord[] memory addressLock = _locksTable[beneficiary];
        uint256 totalBalance = 0;
        uint256 lockedBalance = 0;

        for (uint256 i = 0; i < addressLock.length; i++) {
            if (_isVirtual(addressLock[i].category) == isVirtual) {
                uint32 periodsWithdrawn = addressLock[i].periodsLocked >> 16;
                uint32 periodsTotal =
                    addressLock[i].periodsLocked & PERIODS_MASK;
                uint256 periodAmount =
                    addressLock[i].amountLocked / periodsTotal;

                totalBalance +=
                    addressLock[i].amountLocked -
                    (periodAmount * periodsWithdrawn);
                for (uint256 j = periodsWithdrawn; j < periodsTotal; j++) {
                    if (
                        addressLock[i].freezeTime +
                            addressLock[i].periodLength *
                            (j + 1) >=
                        block.timestamp
                    ) {
                        lockedBalance += periodAmount;
                    }
                }
            }
        }

        return (totalBalance, lockedBalance);
    }

    function _getLock(address beneficiary, uint32 idx)
        internal
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint32 periodsWithdrawn =
            _locksTable[beneficiary][idx].periodsLocked >> 16;
        uint32 periodsTotal =
            _locksTable[beneficiary][idx].periodsLocked & PERIODS_MASK;

        return (
            _locksTable[beneficiary][idx].freezeTime,
            _locksTable[beneficiary][idx].amountLocked.div(periodsTotal).mul(
                periodsTotal - periodsWithdrawn
            ),
            _locksTable[beneficiary][idx].category & ~VIRTUAL_MASK
        );
    }

    function _isVirtual(uint32 v) internal pure returns (bool) {
        return (v & VIRTUAL_MASK) > 0;
    }

    // ------------------------------------------------------------------------
    // Owner can transfer out any accidentally sent ERC20 tokens
    // ------------------------------------------------------------------------
    function transferAnyERC20Token(
        address tokenAddress,
        address beneficiary,
        uint256 tokens
    ) public onlyAdmin returns (bool success) {
        require(tokenAddress != address(0), "Token address cannot be 0");
        require(tokenAddress != _token, "Token cannot be ours");

        return IERC20(tokenAddress).transfer(beneficiary, tokens);
    }
}
