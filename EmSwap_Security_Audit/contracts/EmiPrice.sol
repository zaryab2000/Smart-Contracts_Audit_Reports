// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.2;

import "@openzeppelin/contracts/proxy/Initializable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./libraries/Priviledgeable.sol";
import "./EmiFactory.sol";
import "./Emiswap.sol";
import "./interfaces/IOneSplit.sol";

contract EmiPrice is Initializable, Priviledgeable {
    using SafeMath for uint256;
    using SafeMath for uint256;
    address[3] public market;
    address private _DAI;
    uint256 constant MARKET_OUR = 0;
    uint256 constant MARKET_UNISWAP = 1;
    uint256 constant MARKET_1INCH = 2;


 string public codeVersion = "EmiPrice v1.0-145-gf234c9e";


    /**
     * @dev Upgradeable proxy constructor replacement
     */
    function initialize(
        address _market1,
        address _market2,
        address _market3,
        address _daitoken
    ) public initializer {
        require(_market2 != address(0), "Market address cannot be 0");
        require(_market3 != address(0), "Market address cannot be 0");
        require(_daitoken != address(0), "DAI token address cannot be 0");

        market[0] = _market1;
        market[1] = _market2;
        market[2] = _market3;
        _DAI = _daitoken;
        _addAdmin(msg.sender);
    }

    /**
     * @dev Return coin prices * 10e5 (to solve rounding problems, this yields 5 meaning digits after decimal point)
     */
    function getCoinPrices(address[] calldata _coins, uint8 _market)
        external
        view
        returns (uint256[] memory prices)
    {
        require(_market < market.length, "Wrong market index");
        uint256[] memory _prices;

        _prices = new uint256[](_coins.length);

        if (_market == MARKET_UNISWAP) {
            _getUniswapPrice(_coins, _prices);
        } else if (_market == MARKET_OUR) {
            _getOurPrice(_coins, _prices);
        } else {
            _get1inchPrice(_coins, _prices);
        }

        return _prices;
    }

    function changeDAI(address _daiToken) external onlyAdmin {
        require(_daiToken != address(0), "Token address cannot be 0");
        _DAI = _daiToken;
    }

    function changeMarket(uint8 idx, address _market) external onlyAdmin {
        require(_market != address(0), "Token address cannot be 0");
        require(idx < 3, "Wrong market index");

        market[idx] = _market;
    }

    // internal methods
    function _getUniswapPrice(
        address[] calldata _coins,
        uint256[] memory _prices
    ) internal view {
        IUniswapV2Factory _factory = IUniswapV2Factory(market[MARKET_UNISWAP]);
        IUniswapV2Pair _p;

        if (address(_factory) == address(0)) {
            return;
        }

        for (uint256 i = 0; i < _coins.length; i++) {
            _p = IUniswapV2Pair(_factory.getPair(_coins[i], _DAI));
            uint256 decimal = ERC20(_coins[i]).decimals();
            if (address(_p) == address(0)) {
                _prices[i] = 0;
            } else {
                (uint256 reserv0, uint256 reserv1, ) = _p.getReserves();
                if (reserv1 == 0 || reserv0 == 0) {
                    _prices[i] = 0; // special case
                } else {
                    _prices[i] = address(_coins[i]) < address(_DAI)
                        ? reserv1.mul(10**(23 - decimal)).div(reserv0)
                        : reserv0.mul(10**(23 - decimal)).div(reserv1);
                }
            }
        }
    }

    function _getOurPrice(address[] calldata _coins, uint256[] memory _prices)
        internal
        view
    {
        EmiFactory _factory = EmiFactory(market[MARKET_OUR]);
        Emiswap _p;

        if (address(_factory) == address(0)) {
            return;
        }
        for (uint256 i = 0; i < _coins.length; i++) {
            _p = Emiswap(_factory.pools(IERC20(_coins[i]), IERC20(_DAI)));
            if (address(_p) == address(0)) {
                _prices[i] = 0;
            } else {
                (_prices[i], ) = _p.getReturn(
                    IERC20(_coins[i]),
                    IERC20(_DAI),
                    10**uint256(ERC20(_coins[i]).decimals())
                );
                _prices[i] = _prices[i].div(10**13);
            }
        }
    }

    function _get1inchPrice(address[] calldata _coins, uint256[] memory _prices)
        internal
        view
    {
        IOneSplit _factory = IOneSplit(market[MARKET_1INCH]);

        if (address(_factory) == address(0)) {
            return;
        }
        for (uint256 i = 0; i < _coins.length; i++) {
            (_prices[i], ) = _factory.getExpectedReturn(
                IERC20(_coins[i]),
                IERC20(_DAI),
                10**uint256(ERC20(_coins[i]).decimals()),
                1,
                0
            );
            _prices[i] = _prices[i].div(10**13); // 18 decimal places minus 5 places for multiples
        }
    }
}
