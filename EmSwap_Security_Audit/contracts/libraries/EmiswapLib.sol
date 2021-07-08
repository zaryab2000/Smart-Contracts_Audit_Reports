// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./../interfaces/IEmiswap.sol";

library EmiswapLib {
    using SafeMath for uint256;
    uint256 public constant FEE_DENOMINATOR = 1e18;

    function previewSwapExactTokenForToken(
        address factory,
        address tokenFrom,
        address tokenTo,
        uint256 ammountFrom
    ) internal view returns (uint256 ammountTo) {
        IEmiswap pairContract =
            IEmiswapRegistry(factory).pools(IERC20(tokenFrom), IERC20(tokenTo));

        if (pairContract != IEmiswap(0)) {
            ammountTo = pairContract.getReturn(
                IERC20(tokenFrom),
                IERC20(tokenTo),
                ammountFrom
            );
        }
    }

    /**************************************************************************************
     * get preview result of virtual swap by route of tokens
     **************************************************************************************/
    function previewSwapbyRoute(
        address factory,
        address[] memory path,
        uint256 ammountFrom
    ) internal view returns (uint256 ammountTo) {
        for (uint256 i = 0; i < path.length - 1; i++) {
            if (path.length >= 2) {
                ammountTo = previewSwapExactTokenForToken(
                    factory,
                    path[i],
                    path[i + 1],
                    ammountFrom
                );

                if (i == (path.length - 2)) {
                    return (ammountTo);
                } else {
                    ammountFrom = ammountTo;
                }
            }
        }
    }

    function fee(address factory) internal view returns (uint256) {
        return IEmiswap(factory).fee();
    }

    // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(
        address factory,
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal view returns (uint256 amountIn) {
        require(amountOut > 0, "EmiswapLibrary: INSUFFICIENT_OUTPUT_AMOUNT");
        require(
            reserveIn > 0 && reserveOut > 0,
            "EmiswapLibrary: INSUFFICIENT_LIQUIDITY"
        );
        uint256 numerator = reserveIn.mul(amountOut).mul(1000);
        uint256 denominator =
            reserveOut.sub(amountOut).mul(
                uint256(1000000000000000000).sub(fee(factory)).div(1e15)
            ); // 997
        amountIn = (numerator / denominator).add(1);
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(
        address factory,
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal view returns (uint256 amountOut) {
        if (amountIn == 0 || reserveIn == 0 || reserveOut == 0) {
            return (0);
        }

        uint256 amountInWithFee =
            amountIn.mul(
                uint256(1000000000000000000).sub(fee(factory)).div(1e15)
            ); //997
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = (denominator == 0 ? 0 : amountOut =
            numerator /
            denominator);
    }

    // performs chained getAmountIn calculations on any number of pairs
    function getAmountsIn(
        address factory,
        uint256 amountOut,
        address[] memory path
    ) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "EmiswapLibrary: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[amounts.length - 1] = amountOut;
        for (uint256 i = path.length - 1; i > 0; i--) {
            IEmiswap pairContract =
                IEmiswapRegistry(factory).pools(
                    IERC20(IERC20(path[i])),
                    IERC20(path[i - 1])
                );

            uint256 reserveIn;
            uint256 reserveOut;

            if (address(pairContract) != address(0)) {
                reserveIn = IEmiswap(pairContract).getBalanceForAddition(
                    IERC20(path[i - 1])
                );
                reserveOut = IEmiswap(pairContract).getBalanceForRemoval(
                    IERC20(path[i])
                );
            }

            amounts[i - 1] = getAmountIn(
                factory,
                amounts[i],
                reserveIn,
                reserveOut
            );
        }
    }

    // performs chained getAmountOut calculations on any number of pairs
    function getAmountsOut(
        address factory,
        uint256 amountIn,
        address[] memory path
    ) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "EmiswapLibrary: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i = 0; i < path.length - 1; i++) {
            IEmiswap pairContract =
                IEmiswapRegistry(factory).pools(
                    IERC20(IERC20(path[i])),
                    IERC20(path[i + 1])
                );

            uint256 reserveIn;
            uint256 reserveOut;

            if (address(pairContract) != address(0)) {
                reserveIn = IEmiswap(pairContract).getBalanceForAddition(
                    IERC20(path[i])
                );
                reserveOut = IEmiswap(pairContract).getBalanceForRemoval(
                    IERC20(path[i + 1])
                );
            }

            amounts[i + 1] = getAmountOut(
                factory,
                amounts[i],
                reserveIn,
                reserveOut
            );
        }
    }

    // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) internal pure returns (uint256 amountB) {
        require(amountA > 0, "EmiswapLibrary: INSUFFICIENT_AMOUNT");
        require(
            reserveA > 0 && reserveB > 0,
            "EmiswapLibrary: INSUFFICIENT_LIQUIDITY"
        );
        amountB = amountA.mul(reserveB) / reserveA;
    }
}
