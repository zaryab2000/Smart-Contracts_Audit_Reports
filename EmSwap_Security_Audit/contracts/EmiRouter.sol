// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IEmiswap.sol";
import "./libraries/EmiswapLib.sol";
import "./libraries/TransferHelper.sol";
import "./interfaces/IWETH.sol";

contract EmiRouter {
    using SafeMath for uint256;

    address public factory;
    address public WETH;

    struct PoolData {
        IEmiswap pool;
        uint256 balanceA;
        uint256 balanceB;
    }

    event Log(uint256 a, uint256 b);

    constructor(address _factory, address _wEth) public {
        factory = _factory;
        WETH = _wEth;
    }

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    // **** Pool Info ****

    function tokenToIERC(IERC20 _token) public view returns (IERC20) {
        return (address(_token) == address(0) ? IERC20(WETH) : _token);
    }

    function getPoolDataList(
        IERC20[] memory tokenAList,
        IERC20[] memory tokenBList
    ) public view returns (PoolData[] memory dataList) {
        if (tokenAList.length > 0 && tokenAList.length == tokenBList.length) {
            dataList = new PoolData[](tokenAList.length);
            for (uint256 i = 0; i < tokenAList.length; i++) {
                if (
                    address(
                        IEmiswapRegistry(address(factory)).pools(
                            tokenToIERC(tokenAList[i]),
                            tokenToIERC(tokenBList[i])
                        )
                    ) != address(0)
                ) {
                    dataList[i].pool = IEmiswapRegistry(address(factory)).pools(
                        tokenToIERC(tokenAList[i]),
                        tokenToIERC(tokenBList[i])
                    );
                    dataList[i].balanceA = IEmiswap(address(dataList[i].pool))
                        .getBalanceForAddition(tokenToIERC(tokenAList[i]));
                    dataList[i].balanceB = IEmiswap(address(dataList[i].pool))
                        .getBalanceForAddition(tokenToIERC(tokenBList[i]));
                }
            }
        } else {
            dataList = new PoolData[](1);
        }
    }

    function getReservesByPool(address pool)
        public
        view
        returns (uint256 _reserve0, uint256 _reserve1)
    {
        _reserve0 = IEmiswap(pool).getBalanceForAddition(
            IEmiswap(pool).tokens(0)
        );
        _reserve1 = IEmiswap(pool).getBalanceForAddition(
            IEmiswap(pool).tokens(1)
        );
    }

    function getReserves(IERC20 token0, IERC20 token1)
        public
        view
        returns (
            uint256 _reserve0,
            uint256 _reserve1,
            address poolAddresss
        )
    {
        if (
            address(
                IEmiswapRegistry(address(factory)).pools(
                    tokenToIERC(token0),
                    tokenToIERC(token1)
                )
            ) != address(0)
        ) {
            _reserve0 = IEmiswapRegistry(address(factory))
                .pools(tokenToIERC(token0), tokenToIERC(token1))
                .getBalanceForAddition(tokenToIERC(token0));
            _reserve1 = IEmiswapRegistry(address(factory))
                .pools(tokenToIERC(token0), tokenToIERC(token1))
                .getBalanceForAddition(tokenToIERC(token1));
            poolAddresss = address(
                IEmiswapRegistry(address(factory)).pools(
                    tokenToIERC(token0),
                    tokenToIERC(token1)
                )
            );
        }
    }

    function getExpectedReturn(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount
    )
        public
        view
        returns (uint256 returnAmount, uint256[] memory distribution)
    {
        address[] memory path;
        path = new address[](2);
        path[0] = address(tokenToIERC(fromToken));
        path[1] = address(tokenToIERC(destToken));

        returnAmount = getAmountsOut(amount, path)[1];
        uint256[] memory _distribution;
        _distribution = new uint256[](34);
        _distribution[12] = 1;
        distribution = _distribution;
    }

    // **** Liquidity ****
    /**
     * @param tokenA address of first token in pair
     * @param tokenB address of second token in pair
     * @return LP balance
     */
    function getLiquidity(address tokenA, address tokenB)
        external
        view
        returns (uint256)
    {
        return (
            IERC20(
                address(
                    IEmiswapRegistry(factory).pools(
                        IERC20(tokenA),
                        IERC20(tokenB)
                    )
                )
            )
                .balanceOf(msg.sender)
        );
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        IERC20 ERC20tokenA = IERC20(tokenA);
        IERC20 ERC20tokenB = IERC20(tokenB);
        IEmiswap pairContract =
            IEmiswapRegistry(factory).pools(ERC20tokenA, ERC20tokenB);
        // create the pair if it doesn't exist yet
        if (pairContract == IEmiswap(0)) {
            pairContract = IEmiswapRegistry(factory).deploy(
                ERC20tokenA,
                ERC20tokenB
            );
        }

        uint256 reserveA = pairContract.getBalanceForAddition(ERC20tokenA);
        uint256 reserveB = pairContract.getBalanceForRemoval(ERC20tokenB);

        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal =
                EmiswapLib.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(
                    amountBOptimal >= amountBMin,
                    "EmiswapRouter: INSUFFICIENT_B_AMOUNT"
                );
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal =
                    EmiswapLib.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(
                    amountAOptimal >= amountAMin,
                    "EmiswapRouter: INSUFFICIENT_A_AMOUNT"
                );
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    /**
     * @param tokenA address of first token in pair
     * @param tokenB address of second token in pair
     * @param amountADesired desired amount of first token
     * @param amountBDesired desired amount of second token
     * @param amountAMin minimum amount of first token
     * @param amountBMin minimum amount of second token
     * @param ref referral address
     * @return amountA added liquidity of first token
     * @return amountB added liquidity of second token
     * @return liquidity
     */

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address ref
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        )
    {
        (amountA, amountB) = _addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        IEmiswap pairContract =
            IEmiswapRegistry(factory).pools(IERC20(tokenA), IERC20(tokenB));

        TransferHelper.safeTransferFrom(
            tokenA,
            msg.sender,
            address(this),
            amountA
        );
        TransferHelper.safeTransferFrom(
            tokenB,
            msg.sender,
            address(this),
            amountB
        );

        TransferHelper.safeApprove(tokenA, address(pairContract), amountA);
        TransferHelper.safeApprove(tokenB, address(pairContract), amountB);

        uint256[] memory amounts;
        amounts = new uint256[](2);
        uint256[] memory minAmounts;
        minAmounts = new uint256[](2);

        if (tokenA < tokenB) {
            amounts[0] = amountA;
            amounts[1] = amountB;
            minAmounts[0] = amountAMin;
            minAmounts[1] = amountBMin;
        } else {
            amounts[0] = amountB;
            amounts[1] = amountA;
            minAmounts[0] = amountBMin;
            minAmounts[1] = amountAMin;
        }

        //emit Log(amounts[0], amounts[1]);
        liquidity = IEmiswap(pairContract).deposit(amounts, minAmounts, ref);
        TransferHelper.safeTransfer(
            address(pairContract),
            msg.sender,
            liquidity
        );
    }

    /**
     * @param token address of token
     * @param amountTokenDesired desired amount of token
     * @param amountTokenMin minimum amount of token
     * @param amountETHMin minimum amount of ETH
     * @param ref referral address
     * @return amountToken added liquidity of token
     * @return amountETH added liquidity of ETH
     * @return liquidity
     */
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address ref
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        )
    {
        (amountToken, amountETH) = _addLiquidity(
            token,
            WETH,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountETHMin
        );
        IEmiswap pairContract =
            IEmiswapRegistry(factory).pools(IERC20(token), IERC20(WETH));
        TransferHelper.safeTransferFrom(
            token,
            msg.sender,
            address(this),
            amountToken
        );
        TransferHelper.safeApprove(token, address(pairContract), amountToken);
        IWETH(WETH).deposit{value: amountETH}();
        TransferHelper.safeApprove(WETH, address(pairContract), amountETH);

        uint256[] memory amounts;
        amounts = new uint256[](2);
        uint256[] memory minAmounts;
        minAmounts = new uint256[](2);

        if (token < WETH) {
            amounts[0] = amountToken;
            amounts[1] = amountETH;
            minAmounts[0] = amountTokenMin;
            minAmounts[1] = amountETHMin;
        } else {
            amounts[0] = amountETH;
            amounts[1] = amountToken;
            minAmounts[0] = amountETHMin;
            minAmounts[1] = amountTokenMin;
        }
        liquidity = IEmiswap(pairContract).deposit(amounts, minAmounts, ref);
        TransferHelper.safeTransfer(
            address(pairContract),
            msg.sender,
            liquidity
        );
    }

    // **** REMOVE LIQUIDITY ****
    /**
     * @param tokenA address of first token in pair
     * @param tokenB address of second token in pair
     * @param liquidity LP token
     * @param amountAMin minimum amount of first token
     * @param amountBMin minimum amount of second token
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) public {
        IEmiswap pairContract =
            IEmiswapRegistry(factory).pools(IERC20(tokenA), IERC20(tokenB));
        TransferHelper.safeTransferFrom(
            address(pairContract),
            msg.sender,
            address(this),
            liquidity
        ); // send liquidity to this

        uint256[] memory minReturns;
        minReturns = new uint256[](2);

        if (tokenA < tokenB) {
            minReturns[0] = amountAMin;
            minReturns[1] = amountBMin;
        } else {
            minReturns[0] = amountBMin;
            minReturns[1] = amountAMin;
        }
        uint256 tokenAbalance = IERC20(tokenA).balanceOf(address(this));
        uint256 tokenBbalance = IERC20(tokenB).balanceOf(address(this));

        pairContract.withdraw(liquidity, minReturns);

        tokenAbalance = IERC20(tokenA).balanceOf(address(this)).sub(
            tokenAbalance
        );
        tokenBbalance = IERC20(tokenB).balanceOf(address(this)).sub(
            tokenBbalance
        );

        TransferHelper.safeTransfer(tokenA, msg.sender, tokenAbalance);
        TransferHelper.safeTransfer(tokenB, msg.sender, tokenBbalance);
    }

    /**
     * @param token address of token
     * @param liquidity LP token amount
     * @param amountTokenMin minimum amount of token
     * @param amountETHMin minimum amount of ETH
     */
    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin
    ) public {
        IEmiswap pairContract =
            IEmiswapRegistry(factory).pools(IERC20(token), IERC20(WETH));
        TransferHelper.safeTransferFrom(
            address(pairContract),
            msg.sender,
            address(this),
            liquidity
        ); // send liquidity to this

        uint256[] memory minReturns;
        minReturns = new uint256[](2);

        if (token < WETH) {
            minReturns[0] = amountTokenMin;
            minReturns[1] = amountETHMin;
        } else {
            minReturns[0] = amountETHMin;
            minReturns[1] = amountTokenMin;
        }

        uint256 tokenbalance = IERC20(token).balanceOf(address(this));
        uint256 WETHbalance = IERC20(WETH).balanceOf(address(this));

        pairContract.withdraw(liquidity, minReturns);

        tokenbalance = IERC20(token).balanceOf(address(this)).sub(tokenbalance);
        WETHbalance = IERC20(WETH).balanceOf(address(this)).sub(WETHbalance);

        TransferHelper.safeTransfer(token, msg.sender, tokenbalance);

        // convert WETH and send back raw ETH
        IWETH(WETH).withdraw(WETHbalance);
        TransferHelper.safeTransferETH(msg.sender, WETHbalance);
    }

    // **** SWAP ****

    function _swap_(
        address tokenFrom,
        address tokenTo,
        uint256 ammountFrom,
        address to,
        address ref
    ) internal returns (uint256 ammountTo) {
        IEmiswap pairContract =
            IEmiswapRegistry(factory).pools(IERC20(tokenFrom), IERC20(tokenTo));

        if (
            pairContract.getReturn(
                IERC20(tokenFrom),
                IERC20(tokenTo),
                ammountFrom
            ) > 0
        ) {
            TransferHelper.safeApprove(
                tokenFrom,
                address(pairContract),
                ammountFrom
            );
            ammountTo = pairContract.swap(
                IERC20(tokenFrom),
                IERC20(tokenTo),
                ammountFrom,
                0,
                to,
                ref
            );
        }
    }

    function _swapbyRoute(
        address[] memory path,
        uint256 ammountFrom,
        address to,
        address ref
    ) internal returns (uint256 ammountTo) {
        for (uint256 i = 0; i < path.length - 1; i++) {
            if (path.length >= 2) {
                uint256 _ammountTo =
                    _swap_(
                        path[i],
                        path[i + 1],
                        ammountFrom,
                        (i == (path.length - 2) ? to : address(this)),
                        ref
                    );
                if (i == (path.length - 2)) {
                    return (_ammountTo);
                } else {
                    ammountFrom = _ammountTo;
                }
            }
        }
    }

    /**
     * @param amountIn exact in value of source token
     * @param amountOutMin minimum amount value of result token
     * @param path array of token addresses, represent the path for swaps
     * @param to send result token to
     * @param ref referral
     * @return amounts result amount
     */

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        address ref
    ) external returns (uint256[] memory amounts) {
        amounts = getAmountsOut(amountIn, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "EmiswapRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );

        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            address(this),
            amountIn
        );
        _swapbyRoute(path, amountIn, to, ref);
    }

    /**
     * @param amountOut exact in value of result token
     * @param amountInMax maximum amount value of source token
     * @param path array of token addresses, represent the path for swaps
     * @param to send result token to
     * @param ref referral
     * @return amounts result amount values
     */

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        address ref
    ) external returns (uint256[] memory amounts) {
        amounts = getAmountsIn(amountOut, path);
        require(
            amounts[0] <= amountInMax,
            "EmiswapRouter: EXCESSIVE_INPUT_AMOUNT"
        );

        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            address(this),
            amounts[0]
        );
        _swapbyRoute(path, amounts[0], to, ref);
    }

    /**
     * @param amountOutMin minimum amount value of result token
     * @param path array of token addresses, represent the path for swaps
     * @param to send result token to
     * @param ref referral
     * @return amounts result token amount values
     */

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        address ref
    ) external payable returns (uint256[] memory amounts) {
        require(path[0] == WETH, "EmiswapRouter: INVALID_PATH");
        amounts = getAmountsOut(msg.value, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "EmiswapRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        IWETH(WETH).deposit{value: amounts[0]}();
        _swapbyRoute(path, amounts[0], to, ref);
    }

    /**
     * @param amountOut amount value of result ETH
     * @param amountInMax maximum amount of source token
     * @param path array of token addresses, represent the path for swaps, (WETH for ETH)
     * @param to send result token to
     * @param ref referral
     * @return amounts result token amount values
     */

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        address ref
    ) external returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WETH, "EmiswapRouter: INVALID_PATH");
        amounts = getAmountsIn(amountOut, path);
        require(amounts[0] <= amountInMax, "EmiswapRouter: EXCESSIVE_AMOUNT");

        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            address(this),
            amounts[0]
        );

        uint256 result = _swapbyRoute(path, amounts[0], address(this), ref);

        IWETH(WETH).withdraw(result);
        TransferHelper.safeTransferETH(to, result);
    }

    /**
     * @param amountIn amount value of source token
     * @param path array of token addresses, represent the path for swaps, (WETH for ETH)
     * @param to send result token to
     * @param ref referral
     */

    function swapExactTokensForETH(
        uint256 amountIn,
        address[] calldata path,
        address to,
        address ref
    ) external {
        require(path[path.length - 1] == WETH, "EmiswapRouter: INVALID_PATH");
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            address(this),
            amountIn
        );

        uint256 result = _swapbyRoute(path, amountIn, address(this), ref);

        IWETH(WETH).withdraw(result);
        TransferHelper.safeTransferETH(to, result);
    }

    /**
     * @param amountOut amount of result tokens
     * @param path array of token addresses, represent the path for swaps, (WETH for ETH)
     * @param to send result token to
     * @param ref referral
     * @return amounts result token amount values
     */

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        address ref
    ) external payable returns (uint256[] memory amounts) {
        require(path[0] == WETH, "EmiswapRouter: INVALID_PATH");
        amounts = getAmountsIn(amountOut, path);
        require(
            amounts[0] <= msg.value,
            "EmiswapRouter: EXCESSIVE_INPUT_AMOUNT"
        );

        IWETH(WETH).deposit{value: amounts[0]}();

        _swapbyRoute(path, amounts[0], to, ref);
    }

    // **** LIBRARY FUNCTIONS ****
    /**
     * @param amountIn amount of source token
     * @param path array of token addresses, represent the path for swaps, (WETH for ETH)
     * @return amounts result token amount values
     */
    function getAmountsOut(uint256 amountIn, address[] memory path)
        public
        view
        returns (uint256[] memory amounts)
    {
        return EmiswapLib.getAmountsOut(factory, amountIn, path);
    }

    /**
     * @param amountOut amount of result token
     * @param path array of token addresses, represent the path for swaps, (WETH for ETH)
     * @return amounts result token amount values
     */
    function getAmountsIn(uint256 amountOut, address[] memory path)
        public
        view
        returns (uint256[] memory amounts)
    {
        return EmiswapLib.getAmountsIn(factory, amountOut, path);
    }
}
