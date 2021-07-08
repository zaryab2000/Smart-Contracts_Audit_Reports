// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IEmiReferral.sol";
import "./interfaces/IESW.sol";
import "./interfaces/IERC20Detailed.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./libraries/Priviledgeable.sol";

contract CrowdSale is Initializable, Priviledgeable {
    using SafeMath for uint256;
    using SafeMath for uint32;
    using SafeERC20 for IERC20;

    event Buy(
        address account,
        uint256 amount,
        uint32 coinId,
        uint256 coinAmount,
        address referral
    );

    struct Coin {
        address token;
        string name;
        string symbol;
        uint8 decimals;
        uint32 rate;
        uint8 status;
    }

    mapping(uint16 => Coin) internal _coins;
    mapping(address => uint16) public coinIndex;
    uint16 internal _coinCounter;
    uint32 internal _ratePrecision;
    /******************************************************************
     * _token - ESW token
     * _wethToken - WETH token
     * _uniswapFactory - uniswap factory address
     * referralStore - referral contract address
     * foundationWallet - foundation wallet
     * teamWallet - team wallet
     *******************************************************************/
    address internal _token;
    address internal _wethToken;
    address internal _uniswapFactory;
    address internal referralStore;
    address payable public foundationWallet;
    address public teamWallet;
    address internal defRef;

    // !!!In updates to contracts set new variables strictly below this line!!!
    //-----------------------------------------------------------------------------------
 string public codeVersion = "CrowdSale v1.0-145-gf234c9e";
    uint256 public crowdSalePool = 40_000_000e18;
    bool public isStoped;

    modifier crowdSaleworking {
        require(!isStoped, "CrowdSale: stoped!");
        _;
    }

    event BuyPresale(address account, uint256 amount, uint32 sinceDate);

    //-----------------------------------------------------------------------------------
    // Smart contract Constructor
    //-----------------------------------------------------------------------------------

    function initialize(
        address eswToken,
        address uniswapFactory,
        address referralStoreInput,
        address wethToken,
        address payable _foundationWallet,
        address _teamWallet
    ) public initializer {
        require(
            eswToken != address(0) ||
                uniswapFactory != address(0) ||
                referralStoreInput != address(0) ||
                wethToken != address(0) ||
                _foundationWallet != address(0) ||
                _teamWallet != address(0),
            "Sale:Addresses empty"
        );
        _token = eswToken;
        _uniswapFactory = uniswapFactory;
        referralStore = referralStoreInput;
        _wethToken = wethToken;
        foundationWallet = _foundationWallet;
        teamWallet = _teamWallet;
        _ratePrecision = 10000;
        defRef = address(0xdF3242dE305d033Bb87334169faBBf3b7d3D96c2);
        _addAdmin(msg.sender);
    }

    /*
     * update crowdsale params
     * @param eswToken - ESW token address
     * @param uniswapFactory - uniswap factory address, for getting market rates
     * @param referralStoreInput - referral contract address
     * @param wethToken - wethToken token address
     * @param _foundationWallet - _foundationWallet wallet address
     * @param _teamWallet - _teamWallet wallet address
     * @param _defRef - _defRef wallet address
     */
    function updateParams(
        address eswToken,
        address uniswapFactory,
        address referralStoreInput,
        address wethToken,
        address payable _foundationWallet,
        address _teamWallet,
        address _defRef
    ) public onlyAdmin {
        require(
            eswToken != address(0) ||
                uniswapFactory != address(0) ||
                referralStoreInput != address(0) ||
                wethToken != address(0) ||
                _foundationWallet != address(0) ||
                _teamWallet != address(0) ||
                _defRef != address(0),
            "Sale: Addresses cannot be empty!"
        );
        _token = eswToken;
        _uniswapFactory = uniswapFactory;
        referralStore = referralStoreInput;
        _wethToken = wethToken;
        foundationWallet = _foundationWallet;
        teamWallet = _teamWallet;
        defRef = _defRef;
    }

    /**
     * stop crowdsale buy functions, need admin rights
     */
    function stopCrowdSale(bool isStopedNewValue) public onlyAdmin {
        isStoped = isStopedNewValue;
    }

    /**
     * set new crowdsale pool size
     */
    function setPoolsize(uint256 _newcrowdSalePool) public onlyAdmin {
        crowdSalePool = _newcrowdSalePool;
    }

    /*
     * register tokens in crowdsale
     * @param coinAddress - token address
     * @param rate - token rate
     * @param status - token status
     */
    function fetchCoin(
        address coinAddress,
        uint32 rate,
        uint8 status
    ) public onlyAdmin {
        require(coinIndex[coinAddress] == 0, "Already loaded");
        string memory _name = IERC20Detailed(coinAddress).name();
        string memory _symbol = IERC20Detailed(coinAddress).symbol();
        uint8 _decimals = IERC20Detailed(coinAddress).decimals();

        _coins[_coinCounter] = Coin(
            coinAddress,
            _name,
            _symbol,
            _decimals,
            1 * rate,
            status
        );
        coinIndex[coinAddress] = _coinCounter;
        _coinCounter += 1;
    }

    /*
     * set status for registered token in crowdsale
     * @param index - token index id
     * @param status - token status
     */
    function setStatusByID(uint16 coinId, uint8 status) public onlyAdmin {
        _coins[coinId].status = status;
    }

    /*
     * set rate for registered token in crowdsale
     * @param index - token index id
     * @param rate - token rate
     */
    function setRateByID(uint16 coinId, uint32 rate) public onlyAdmin {
        _coins[coinId].rate = rate;
    }

    /*
     * get ESW token address
     */
    function getToken() external view returns (address) {
        return _token;
    }

    /*
     * get tokens count
     */
    function coinCounter() public view returns (uint16) {
        return _coinCounter;
    }

    /*
     * get registered in crowdsale token's data
     * @param index - token index id
     * @return name - token name
     * @return symbol - token symbol
     * @return decimals - token decimals
     * @return status - token decimals
     */
    function coin(uint16 index)
        public
        view
        returns (
            string memory name,
            string memory symbol,
            uint8 decimals,
            uint8 status
        )
    {
        return (
            _coins[index].name,
            _coins[index].symbol,
            _coins[index].decimals,
            _coins[index].status
        );
    }

    /*
     * get token's rate
     * @param index - token index id
     * @return rate - token rate
     */
    function coinRate(uint16 index) public view returns (uint32 rate) {
        return (_coins[index].rate);
    }

    /*
     * get token's address and status
     * @param index - token index id
     * @return coinAddress - token wallet address
     * @return status - token status (0 - inactive, 1 - active and fixed rate, 3 - active and market rate)
     */
    function coinData(uint16 index)
        public
        view
        returns (address coinAddress, uint8 status)
    {
        return (_coins[index].token, _coins[index].status);
    }

    /*
     * normalise amount to 10**18
     * @param amount - amount to normalise
     * @param coinDecimals - token decimals
     * @param isReverse - if false calc from token value, true - calc from ESW value
     * @return normalised value to result coin decimals
     */
    function _normalizeCoinAmount(
        uint256 amount,
        uint8 coinDecimals,
        bool isReverse
    ) internal pure returns (uint256) {
        if (!isReverse) {
            if (coinDecimals > 18) {
                return amount.div(uint256(10)**(coinDecimals - 18));
            }
            return amount.mul(uint256(10)**(18 - coinDecimals));
        } else {
            if (coinDecimals > 18) {
                return amount.mul(uint256(10)**(coinDecimals - 18));
            }
            return amount.div(uint256(10)**(18 - coinDecimals));
        }
    }

    /*
     * get normalised amount of result tokens
     * @param coinId - crowdsale registered token id
     * @param amount - input token amount
     * @param isReverse - if false calc from token value to ESW value, true - calc from ESW value to token value
     * @return normalised value of result tokens
     */
    function getBuyCoinAmountByID(
        uint16 coinId,
        uint256 amount,
        bool isReverse
    ) public view returns (uint256) {
        if (!isReverse) {
            return
                _normalizeCoinAmount(
                    amount.mul(_ratePrecision).div(_coins[coinId].rate),
                    _coins[coinId].decimals,
                    isReverse
                );
        } else {
            return
                _normalizeCoinAmount(
                    amount.mul(_coins[coinId].rate).div(_ratePrecision),
                    _coins[coinId].decimals,
                    isReverse
                );
        }
    }

    /**
     * Presale function, get lists of weallets, tokens and dates, and virtual freeze it.
     * Presale limits by time and working till 1612137599 (2021-01-31T23:59:59+00:00 in ISO 8601)
     * @param beneficiaries - list of beneficiaries wallets
     * @param tokens - list of ESW tokens amount bought
     * @param sinceDate - list of purchasing dates
     */
    function presaleBulkLoad(
        address[] memory beneficiaries,
        uint256[] memory tokens,
        uint32[] memory sinceDate
    ) public onlyAdmin {
        require(beneficiaries.length > 0, "Sale:Array empty");
        require(beneficiaries.length == sinceDate.length, "Sale:Arrays length");
        require(sinceDate.length == tokens.length, "Sale:Arrays length");
        require(now <= 1613340000, "Sale: presale is over"); // 15 feb 2021 00:00 GMT

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            crowdSalePool = crowdSalePool.sub(tokens[i]);
            emit BuyPresale(beneficiaries[i], tokens[i], sinceDate[i]);
        }
    }

    /**
     * Buy ESW for tokens view,
     * @param coinAddress - payment token address
     * @param amount - payment token amount (isReverse = false), ESW token amount (isReverse = true),
     * @param isReverse - 'false' for view from payment token to ESW amount, 'true' for view from ESW amount to payment token amount
     * @return currentTokenAmount - ESW amount
     * @return coinId - crowdsale registered token id
     * @return coinAmount - rate in case of market token rate
     */
    function buyView(
        address coinAddress,
        uint256 amount,
        bool isReverse
    )
        public
        view
        returns (
            uint256 currentTokenAmount,
            uint16 coinId,
            uint256 coinAmount
        )
    {
        coinId = coinIndex[coinAddress];

        if (
            (coinAddress != _coins[coinId].token) ||
            (_coins[coinId].status == 0) ||
            (amount == 0)
        ) {
            return (currentTokenAmount, coinId, coinAmount);
        }

        // if amount is ESW
        if (isReverse && (amount.mul(105).div(100) > crowdSalePool)) {
            return (currentTokenAmount, coinId, coinAmount);
        }

        coinAmount = amount;

        currentTokenAmount = 0;

        if (_coins[coinId].status == 1) {
            currentTokenAmount = getBuyCoinAmountByID(
                coinId,
                coinAmount,
                isReverse
            );
        } else {
            // get pair pool
            address pairContract =
                IUniswapV2Factory(_uniswapFactory).getPair(
                    _coins[coinId].token,
                    _coins[0].token
                );

            if (pairContract == address(0)) {
                return (0, 0, 0);
            }

            // get pool reserves
            uint112 reserve0;
            uint112 reserve1;
            if (!isReverse) {
                (reserve0, reserve1, ) = IUniswapV2Pair(pairContract)
                    .getReserves();
            } else {
                (reserve1, reserve0, ) = IUniswapV2Pair(pairContract)
                    .getReserves();
            }

            // token0 1 : token1 10 => 1:10, coinamount=amount*10/1
            if (IUniswapV2Pair(pairContract).token1() == _coins[0].token) {
                coinAmount = _getAmountOut(amount, reserve0, reserve1);
            } else {
                coinAmount = _getAmountOut(amount, reserve1, reserve0);
            }
            currentTokenAmount = (
                isReverse
                    ? coinAmount.mul(_coins[0].rate).div(_ratePrecision)
                    : coinAmount.mul(_ratePrecision).div(_coins[0].rate)
            );
        }

        if (
            !isReverse && (currentTokenAmount.mul(105).div(100) > crowdSalePool)
        ) {
            return (0, 0, 0);
        }

        if ((currentTokenAmount == 0)) {
            return (0, 0, 0);
        }

        return (currentTokenAmount, coinId, coinAmount);
    }

    /**
     * Buy ESW for tokens,
     * @param coinAddress - payment token address
     * @param amount - payment token amount (isReverse = false), ESW token amount (isReverse = true),
     * @param referralInput - referrral address
     * @param isReverse - 'false' for view from payment token to ESW amount, 'true' for view from ESW amount to payment token amount
     */
    function buy(
        address coinAddress,
        uint256 amount,
        address referralInput,
        bool isReverse
    ) public crowdSaleworking {
        require(referralInput != msg.sender, "Sale:ref!");
        require(amount > 0, "Sale:amount needed");
        require(
            coinAddress == _coins[coinIndex[coinAddress]].token,
            "Sale:Coin not allowed"
        );
        require(
            _coins[coinIndex[coinAddress]].status != 0,
            "Sale:Coin not active"
        );

        (uint256 currentTokenAmount, uint16 coinId, ) =
            buyView(coinAddress, amount, isReverse);

        require(currentTokenAmount > 0, "Sale:0 ESW");

        uint256 eswCurrentTokenAmount;
        uint256 paymentTokenAmount;
        if (!isReverse) {
            eswCurrentTokenAmount = currentTokenAmount;
            paymentTokenAmount = amount;
        } else {
            eswCurrentTokenAmount = amount;
            paymentTokenAmount = currentTokenAmount;
        }

        require(
            eswCurrentTokenAmount.mul(105).div(100) <= crowdSalePool,
            "Sale:limit exceeded"
        );
        crowdSalePool = crowdSalePool.sub(eswCurrentTokenAmount);
        IERC20(coinAddress).safeTransferFrom(
            msg.sender,
            foundationWallet,
            paymentTokenAmount
        );

        emit Buy(
            msg.sender,
            eswCurrentTokenAmount,
            coinId,
            paymentTokenAmount,
            _saveReferrals(referralInput)
        );
    }

    /**
     * Rate input amount in base token (DAI) value with market rate
     * @param amountIn - input token amount
     * @param reserveIn - reserve of payment token
     * @param reserveOut - reserve of base USD token (DAI)
     * @return amountOut - input amount rated in base token (DAI)
     */
    function _getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountOut) {
        require(amountIn > 0, "Sale:_INPUT");
        require(reserveIn > 0 && reserveOut > 0, "Sale:_LIQUIDITY");
        amountOut = amountIn.mul(reserveOut).div(reserveIn);
    }

    /**
     * Buy ESW for ETH view
     * @param amount - ETH amount (isReverse=false), ESW amount (isReverse=true)
     * @param isReverse - 'false' view to calc ESW from input ETH, 'true' view to calc ETH from input ESW
     * @return currentTokenAmount - 'false' view ESW amount, 'true' view ETH amount
     * @return coinAmount - input amount rated in base token (DAI)
     */
    function buyWithETHView(uint256 amount, bool isReverse)
        public
        view
        returns (uint256 currentTokenAmount, uint256 coinAmount)
    {
        coinAmount = 0;
        currentTokenAmount = 0;

        if (amount == 0) {
            return (0, 0);
        }

        // Check ESW limits
        if (isReverse && amount.mul(105).div(100) > crowdSalePool) {
            return (0, 0);
        }

        address pairContract =
            IUniswapV2Factory(_uniswapFactory).getPair(
                _wethToken,
                _coins[0].token
            );

        if (pairContract == address(0)) {
            return (0, 0);
        }

        uint112 reserve0;
        uint112 reserve1;

        if (!isReverse) {
            (reserve0, reserve1, ) = IUniswapV2Pair(pairContract).getReserves();
        } else {
            (reserve1, reserve0, ) = IUniswapV2Pair(pairContract).getReserves();
        }

        coinAmount = (
            IUniswapV2Pair(pairContract).token1() == _coins[0].token
                ? _getAmountOut(amount, reserve0, reserve1)
                : _getAmountOut(amount, reserve1, reserve0)
        );

        currentTokenAmount = (
            isReverse
                ? coinAmount.mul(_coins[0].rate).div(_ratePrecision)
                : coinAmount.mul(_ratePrecision).div(_coins[0].rate)
        );

        if (currentTokenAmount <= 0) {
            return (0, 0);
        }

        if (
            !isReverse && currentTokenAmount.mul(105).div(100) > crowdSalePool
        ) {
            return (0, 0);
        }

        return (currentTokenAmount, coinAmount);
    }

    /**
     * @param referralInput address of referral
     * @param amount in case isReverse=false amount is ETH value, in case isReverse=true amount is ESW value
     * @param isReverse switch calc mode false - calc from ETH value, true - calc from ESW value
     * slippage - price change value from desired parameter, actual in range 0% - 5%, 5% = 500
     */
    function buyWithETH(
        address referralInput,
        uint256 amount,
        bool isReverse
    ) public payable crowdSaleworking {
        uint256 slippage = 500;

        require(referralInput != msg.sender, "Sale:ref!");

        require(
            msg.value > 0 && (!isReverse ? msg.value == amount : true),
            "Sale:ETH needed"
        );
        if (!isReverse) {
            require(msg.value == amount, "Sale:ETH needed");
        } else {
            require(amount > 0, "Sale:incorrect amount");
        }

        uint256 eswTokenAmount;
        uint256 ethTokenAmount;

        (uint256 currentTokenAmount, ) =
            buyWithETHView((!isReverse ? msg.value : amount), isReverse);

        if (!isReverse) {
            eswTokenAmount = currentTokenAmount;
            ethTokenAmount = msg.value;
        } else {
            eswTokenAmount = amount;
            ethTokenAmount = currentTokenAmount;
        }

        require(
            eswTokenAmount > 0 &&
                ethTokenAmount > 0 &&
                ethTokenAmount.mul(10000 - slippage).div(10000) <= msg.value,
            "Sale:0 ETH"
        );
        require(
            eswTokenAmount.mul(105).div(100) <= crowdSalePool,
            "Sale:limit exceeded"
        );

        crowdSalePool = crowdSalePool.sub(eswTokenAmount);
        foundationWallet.transfer(msg.value);

        emit Buy(
            msg.sender,
            eswTokenAmount,
            999,
            msg.value,
            _saveReferrals(referralInput)
        );
    }

    /**
     * save referral
     * @param referralInput address to save
     */
    function _saveReferrals(address referralInput) internal returns (address) {
        // Get referrals
        address[] memory referrals =
            IEmiReferral(referralStore).getReferralChain(msg.sender);

        if (referrals.length == 0) {
            if (address(referralInput) != address(0x0)) {
                // if have no referral and passed refferal -> set and return it
                IEmiReferral(referralStore).addReferral(
                    msg.sender,
                    referralInput
                );
                return (referralInput);
            } else {
                // if have no referral and not passed refferal -> return zero
                return (address(0));
            }
        } else {
            // already have referral -> return it
            return (referrals[0]);
        }
    }

    /**
     * default payment receive, not supported paramters, so call buyWithETH with 0x0 address with eth value
     */
    receive() external payable {
        buyWithETH(
            address(0),
            msg.value,
            false /* , 10 */ /** default slippage 0.1% */
        );
    }
}
