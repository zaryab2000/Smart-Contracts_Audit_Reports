// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

pragma experimental ABIEncoderV2;


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
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
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
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
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
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
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
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
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
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
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
        require(b != 0, errorMessage);
        return a % b;
    }
}

// File: contracts/InterestCalculator.sol



contract InterestCalculator {
    using SafeMath for uint;
    uint private constant MAX_DAYS = 365;

    function _initCumulativeInterestForDays() internal pure returns(uint[] memory) {
        uint[] memory cumulativeInterestForDays = new uint[](MAX_DAYS.add(1));

        cumulativeInterestForDays[0] = 0;
        cumulativeInterestForDays[1] = 1;
        cumulativeInterestForDays[2] = 2;
        cumulativeInterestForDays[3] = 3;
        cumulativeInterestForDays[4] = 4;
        cumulativeInterestForDays[5] = 6;
        cumulativeInterestForDays[6] = 8;
        cumulativeInterestForDays[7] = 10;
        cumulativeInterestForDays[8] = 13;
        cumulativeInterestForDays[9] = 16;
        cumulativeInterestForDays[10] = 20;
        cumulativeInterestForDays[11] = 24;
        cumulativeInterestForDays[12] = 28;
        cumulativeInterestForDays[13] = 33;
        cumulativeInterestForDays[14] = 38;
        cumulativeInterestForDays[15] = 43;
        cumulativeInterestForDays[16] = 49;
        cumulativeInterestForDays[17] = 55;
        cumulativeInterestForDays[18] = 61;
        cumulativeInterestForDays[19] = 68;
        cumulativeInterestForDays[20] = 75;
        cumulativeInterestForDays[21] = 83;
        cumulativeInterestForDays[22] = 91;
        cumulativeInterestForDays[23] = 99;
        cumulativeInterestForDays[24] = 108;
        cumulativeInterestForDays[25] = 117;
        cumulativeInterestForDays[26] = 127;
        cumulativeInterestForDays[27] = 137;
        cumulativeInterestForDays[28] = 147;
        cumulativeInterestForDays[29] = 158;
        cumulativeInterestForDays[30] = 169;
        cumulativeInterestForDays[31] = 180;
        cumulativeInterestForDays[32] = 192;
        cumulativeInterestForDays[33] = 204;
        cumulativeInterestForDays[34] = 217;
        cumulativeInterestForDays[35] = 230;
        cumulativeInterestForDays[36] = 243;
        cumulativeInterestForDays[37] = 257;
        cumulativeInterestForDays[38] = 271;
        cumulativeInterestForDays[39] = 286;
        cumulativeInterestForDays[40] = 301;
        cumulativeInterestForDays[41] = 316;
        cumulativeInterestForDays[42] = 332;
        cumulativeInterestForDays[43] = 348;
        cumulativeInterestForDays[44] = 365;
        cumulativeInterestForDays[45] = 382;
        cumulativeInterestForDays[46] = 399;
        cumulativeInterestForDays[47] = 417;
        cumulativeInterestForDays[48] = 435;
        cumulativeInterestForDays[49] = 454;
        cumulativeInterestForDays[50] = 473;
        cumulativeInterestForDays[51] = 493;
        cumulativeInterestForDays[52] = 513;
        cumulativeInterestForDays[53] = 533;
        cumulativeInterestForDays[54] = 554;
        cumulativeInterestForDays[55] = 575;
        cumulativeInterestForDays[56] = 597;
        cumulativeInterestForDays[57] = 619;
        cumulativeInterestForDays[58] = 641;
        cumulativeInterestForDays[59] = 664;
        cumulativeInterestForDays[60] = 687;
        cumulativeInterestForDays[61] = 711;
        cumulativeInterestForDays[62] = 735;
        cumulativeInterestForDays[63] = 760;
        cumulativeInterestForDays[64] = 785;
        cumulativeInterestForDays[65] = 810;
        cumulativeInterestForDays[66] = 836;
        cumulativeInterestForDays[67] = 862;
        cumulativeInterestForDays[68] = 889;
        cumulativeInterestForDays[69] = 916;
        cumulativeInterestForDays[70] = 944;
        cumulativeInterestForDays[71] = 972;
        cumulativeInterestForDays[72] = 1001;
        cumulativeInterestForDays[73] = 1030;
        cumulativeInterestForDays[74] = 1060;
        cumulativeInterestForDays[75] = 1090;
        cumulativeInterestForDays[76] = 1120;
        cumulativeInterestForDays[77] = 1151;
        cumulativeInterestForDays[78] = 1182;
        cumulativeInterestForDays[79] = 1214;
        cumulativeInterestForDays[80] = 1246;
        cumulativeInterestForDays[81] = 1279;
        cumulativeInterestForDays[82] = 1312;
        cumulativeInterestForDays[83] = 1346;
        cumulativeInterestForDays[84] = 1380;
        cumulativeInterestForDays[85] = 1415;
        cumulativeInterestForDays[86] = 1450;
        cumulativeInterestForDays[87] = 1486;
        cumulativeInterestForDays[88] = 1522;
        cumulativeInterestForDays[89] = 1558;
        cumulativeInterestForDays[90] = 1595;
        cumulativeInterestForDays[91] = 1632;
        cumulativeInterestForDays[92] = 1670;
        cumulativeInterestForDays[93] = 1708;
        cumulativeInterestForDays[94] = 1747;
        cumulativeInterestForDays[95] = 1786;
        cumulativeInterestForDays[96] = 1826;
        cumulativeInterestForDays[97] = 1866;
        cumulativeInterestForDays[98] = 1907;
        cumulativeInterestForDays[99] = 1948;
        cumulativeInterestForDays[100] = 1990;
        cumulativeInterestForDays[101] = 2032;
        cumulativeInterestForDays[102] = 2075;
        cumulativeInterestForDays[103] = 2118;
        cumulativeInterestForDays[104] = 2162;
        cumulativeInterestForDays[105] = 2206;
        cumulativeInterestForDays[106] = 2251;
        cumulativeInterestForDays[107] = 2296;
        cumulativeInterestForDays[108] = 2342;
        cumulativeInterestForDays[109] = 2388;
        cumulativeInterestForDays[110] = 2435;
        cumulativeInterestForDays[111] = 2482;
        cumulativeInterestForDays[112] = 2530;
        cumulativeInterestForDays[113] = 2578;
        cumulativeInterestForDays[114] = 2627;
        cumulativeInterestForDays[115] = 2676;
        cumulativeInterestForDays[116] = 2726;
        cumulativeInterestForDays[117] = 2776;
        cumulativeInterestForDays[118] = 2827;
        cumulativeInterestForDays[119] = 2879;
        cumulativeInterestForDays[120] = 2931;
        cumulativeInterestForDays[121] = 2984;
        cumulativeInterestForDays[122] = 3037;
        cumulativeInterestForDays[123] = 3091;
        cumulativeInterestForDays[124] = 3145;
        cumulativeInterestForDays[125] = 3200;
        cumulativeInterestForDays[126] = 3255;
        cumulativeInterestForDays[127] = 3311;
        cumulativeInterestForDays[128] = 3367;
        cumulativeInterestForDays[129] = 3424;
        cumulativeInterestForDays[130] = 3481;
        cumulativeInterestForDays[131] = 3539;
        cumulativeInterestForDays[132] = 3598;
        cumulativeInterestForDays[133] = 3657;
        cumulativeInterestForDays[134] = 3717;
        cumulativeInterestForDays[135] = 3777;
        cumulativeInterestForDays[136] = 3838;
        cumulativeInterestForDays[137] = 3899;
        cumulativeInterestForDays[138] = 3961;
        cumulativeInterestForDays[139] = 4024;
        cumulativeInterestForDays[140] = 4087;
        cumulativeInterestForDays[141] = 4151;
        cumulativeInterestForDays[142] = 4215;
        cumulativeInterestForDays[143] = 4280;
        cumulativeInterestForDays[144] = 4345;
        cumulativeInterestForDays[145] = 4411;
        cumulativeInterestForDays[146] = 4478;
        cumulativeInterestForDays[147] = 4545;
        cumulativeInterestForDays[148] = 4613;
        cumulativeInterestForDays[149] = 4681;
        cumulativeInterestForDays[150] = 4750;
        cumulativeInterestForDays[151] = 4819;
        cumulativeInterestForDays[152] = 4889;
        cumulativeInterestForDays[153] = 4960;
        cumulativeInterestForDays[154] = 5031;
        cumulativeInterestForDays[155] = 5103;
        cumulativeInterestForDays[156] = 5175;
        cumulativeInterestForDays[157] = 5248;
        cumulativeInterestForDays[158] = 5322;
        cumulativeInterestForDays[159] = 5396;
        cumulativeInterestForDays[160] = 5471;
        cumulativeInterestForDays[161] = 5547;
        cumulativeInterestForDays[162] = 5623;
        cumulativeInterestForDays[163] = 5700;
        cumulativeInterestForDays[164] = 5777;
        cumulativeInterestForDays[165] = 5855;
        cumulativeInterestForDays[166] = 5934;
        cumulativeInterestForDays[167] = 6013;
        cumulativeInterestForDays[168] = 6093;
        cumulativeInterestForDays[169] = 6173;
        cumulativeInterestForDays[170] = 6254;
        cumulativeInterestForDays[171] = 6336;
        cumulativeInterestForDays[172] = 6418;
        cumulativeInterestForDays[173] = 6501;
        cumulativeInterestForDays[174] = 6585;
        cumulativeInterestForDays[175] = 6669;
        cumulativeInterestForDays[176] = 6754;
        cumulativeInterestForDays[177] = 6840;
        cumulativeInterestForDays[178] = 6926;
        cumulativeInterestForDays[179] = 7013;
        cumulativeInterestForDays[180] = 7101;
        cumulativeInterestForDays[181] = 7189;
        cumulativeInterestForDays[182] = 7278;
        cumulativeInterestForDays[183] = 7368;
        cumulativeInterestForDays[184] = 7458;
        cumulativeInterestForDays[185] = 7549;
        cumulativeInterestForDays[186] = 7641;
        cumulativeInterestForDays[187] = 7733;
        cumulativeInterestForDays[188] = 7826;
        cumulativeInterestForDays[189] = 7920;
        cumulativeInterestForDays[190] = 8014;
        cumulativeInterestForDays[191] = 8109;
        cumulativeInterestForDays[192] = 8205;
        cumulativeInterestForDays[193] = 8301;
        cumulativeInterestForDays[194] = 8398;
        cumulativeInterestForDays[195] = 8496;
        cumulativeInterestForDays[196] = 8594;
        cumulativeInterestForDays[197] = 8693;
        cumulativeInterestForDays[198] = 8793;
        cumulativeInterestForDays[199] = 8893;
        cumulativeInterestForDays[200] = 8994;
        cumulativeInterestForDays[201] = 9096;
        cumulativeInterestForDays[202] = 9199;
        cumulativeInterestForDays[203] = 9302;
        cumulativeInterestForDays[204] = 9406;
        cumulativeInterestForDays[205] = 9511;
        cumulativeInterestForDays[206] = 9616;
        cumulativeInterestForDays[207] = 9722;
        cumulativeInterestForDays[208] = 9829;
        cumulativeInterestForDays[209] = 9937;
        cumulativeInterestForDays[210] = 10045;
        cumulativeInterestForDays[211] = 10154;
        cumulativeInterestForDays[212] = 10264;
        cumulativeInterestForDays[213] = 10374;
        cumulativeInterestForDays[214] = 10485;
        cumulativeInterestForDays[215] = 10597;
        cumulativeInterestForDays[216] = 10710;
        cumulativeInterestForDays[217] = 10823;
        cumulativeInterestForDays[218] = 10937;
        cumulativeInterestForDays[219] = 11052;
        cumulativeInterestForDays[220] = 11168;
        cumulativeInterestForDays[221] = 11284;
        cumulativeInterestForDays[222] = 11401;
        cumulativeInterestForDays[223] = 11519;
        cumulativeInterestForDays[224] = 11638;
        cumulativeInterestForDays[225] = 11757;
        cumulativeInterestForDays[226] = 11877;
        cumulativeInterestForDays[227] = 11998;
        cumulativeInterestForDays[228] = 12120;
        cumulativeInterestForDays[229] = 12243;
        cumulativeInterestForDays[230] = 12366;
        cumulativeInterestForDays[231] = 12490;
        cumulativeInterestForDays[232] = 12615;
        cumulativeInterestForDays[233] = 12741;
        cumulativeInterestForDays[234] = 12867;
        cumulativeInterestForDays[235] = 12994;
        cumulativeInterestForDays[236] = 13122;
        cumulativeInterestForDays[237] = 13251;
        cumulativeInterestForDays[238] = 13381;
        cumulativeInterestForDays[239] = 13511;
        cumulativeInterestForDays[240] = 13642;
        cumulativeInterestForDays[241] = 13774;
        cumulativeInterestForDays[242] = 13907;
        cumulativeInterestForDays[243] = 14041;
        cumulativeInterestForDays[244] = 14176;
        cumulativeInterestForDays[245] = 14311;
        cumulativeInterestForDays[246] = 14447;
        cumulativeInterestForDays[247] = 14584;
        cumulativeInterestForDays[248] = 14722;
        cumulativeInterestForDays[249] = 14861;
        cumulativeInterestForDays[250] = 15001;
        cumulativeInterestForDays[251] = 15141;
        cumulativeInterestForDays[252] = 15282;
        cumulativeInterestForDays[253] = 15424;
        cumulativeInterestForDays[254] = 15567;
        cumulativeInterestForDays[255] = 15711;
        cumulativeInterestForDays[256] = 15856;
        cumulativeInterestForDays[257] = 16001;
        cumulativeInterestForDays[258] = 16147;
        cumulativeInterestForDays[259] = 16294;
        cumulativeInterestForDays[260] = 16442;
        cumulativeInterestForDays[261] = 16591;
        cumulativeInterestForDays[262] = 16741;
        cumulativeInterestForDays[263] = 16892;
        cumulativeInterestForDays[264] = 17044;
        cumulativeInterestForDays[265] = 17196;
        cumulativeInterestForDays[266] = 17349;
        cumulativeInterestForDays[267] = 17503;
        cumulativeInterestForDays[268] = 17658;
        cumulativeInterestForDays[269] = 17814;
        cumulativeInterestForDays[270] = 17971;
        cumulativeInterestForDays[271] = 18129;
        cumulativeInterestForDays[272] = 18288;
        cumulativeInterestForDays[273] = 18448;
        cumulativeInterestForDays[274] = 18608;
        cumulativeInterestForDays[275] = 18769;
        cumulativeInterestForDays[276] = 18931;
        cumulativeInterestForDays[277] = 19094;
        cumulativeInterestForDays[278] = 19258;
        cumulativeInterestForDays[279] = 19423;
        cumulativeInterestForDays[280] = 19589;
        cumulativeInterestForDays[281] = 19756;
        cumulativeInterestForDays[282] = 19924;
        cumulativeInterestForDays[283] = 20093;
        cumulativeInterestForDays[284] = 20263;
        cumulativeInterestForDays[285] = 20434;
        cumulativeInterestForDays[286] = 20606;
        cumulativeInterestForDays[287] = 20779;
        cumulativeInterestForDays[288] = 20953;
        cumulativeInterestForDays[289] = 21127;
        cumulativeInterestForDays[290] = 21302;
        cumulativeInterestForDays[291] = 21478;
        cumulativeInterestForDays[292] = 21655;
        cumulativeInterestForDays[293] = 21833;
        cumulativeInterestForDays[294] = 22012;
        cumulativeInterestForDays[295] = 22192;
        cumulativeInterestForDays[296] = 22373;
        cumulativeInterestForDays[297] = 22555;
        cumulativeInterestForDays[298] = 22738;
        cumulativeInterestForDays[299] = 22922;
        cumulativeInterestForDays[300] = 23107;
        cumulativeInterestForDays[301] = 23293;
        cumulativeInterestForDays[302] = 23480;
        cumulativeInterestForDays[303] = 23668;
        cumulativeInterestForDays[304] = 23857;
        cumulativeInterestForDays[305] = 24047;
        cumulativeInterestForDays[306] = 24238;
        cumulativeInterestForDays[307] = 24430;
        cumulativeInterestForDays[308] = 24623;
        cumulativeInterestForDays[309] = 24817;
        cumulativeInterestForDays[310] = 25012;
        cumulativeInterestForDays[311] = 25208;
        cumulativeInterestForDays[312] = 25405;
        cumulativeInterestForDays[313] = 25603;
        cumulativeInterestForDays[314] = 25803;
        cumulativeInterestForDays[315] = 26004;
        cumulativeInterestForDays[316] = 26206;
        cumulativeInterestForDays[317] = 26409;
        cumulativeInterestForDays[318] = 26613;
        cumulativeInterestForDays[319] = 26818;
        cumulativeInterestForDays[320] = 27024;
        cumulativeInterestForDays[321] = 27231;
        cumulativeInterestForDays[322] = 27439;
        cumulativeInterestForDays[323] = 27648;
        cumulativeInterestForDays[324] = 27858;
        cumulativeInterestForDays[325] = 28069;
        cumulativeInterestForDays[326] = 28281;
        cumulativeInterestForDays[327] = 28494;
        cumulativeInterestForDays[328] = 28709;
        cumulativeInterestForDays[329] = 28925;
        cumulativeInterestForDays[330] = 29142;
        cumulativeInterestForDays[331] = 29360;
        cumulativeInterestForDays[332] = 29579;
        cumulativeInterestForDays[333] = 29799;
        cumulativeInterestForDays[334] = 30020;
        cumulativeInterestForDays[335] = 30242;
        cumulativeInterestForDays[336] = 30465;
        cumulativeInterestForDays[337] = 30690;
        cumulativeInterestForDays[338] = 30916;
        cumulativeInterestForDays[339] = 31143;
        cumulativeInterestForDays[340] = 31371;
        cumulativeInterestForDays[341] = 31600;
        cumulativeInterestForDays[342] = 31830;
        cumulativeInterestForDays[343] = 32061;
        cumulativeInterestForDays[344] = 32294;
        cumulativeInterestForDays[345] = 32528;
        cumulativeInterestForDays[346] = 32763;
        cumulativeInterestForDays[347] = 32999;
        cumulativeInterestForDays[348] = 33236;
        cumulativeInterestForDays[349] = 33475;
        cumulativeInterestForDays[350] = 33715;
        cumulativeInterestForDays[351] = 33956;
        cumulativeInterestForDays[352] = 34198;
        cumulativeInterestForDays[353] = 34441;
        cumulativeInterestForDays[354] = 34685;
        cumulativeInterestForDays[355] = 34931;
        cumulativeInterestForDays[356] = 35178;
        cumulativeInterestForDays[357] = 35426;
        cumulativeInterestForDays[358] = 35675;
        cumulativeInterestForDays[359] = 35926;
        cumulativeInterestForDays[360] = 36178;
        cumulativeInterestForDays[361] = 36431;
        cumulativeInterestForDays[362] = 36685;
        cumulativeInterestForDays[363] = 36940;
        cumulativeInterestForDays[364] = 37197;
        cumulativeInterestForDays[365] = 37455;

        return cumulativeInterestForDays;
    }

    function _getInterestTillDays(uint _day) internal pure returns(uint) {
        require(_day <= MAX_DAYS);

        return _initCumulativeInterestForDays()[_day];
    }
}

// File: contracts/Events.sol




contract Events {
    event Deposit(address user, uint amount, uint8 stakeId, address uplinkAddress, uint uplinkStakeId);
    event Withdrawn(address user, uint amount);
    event ReInvest(address user, uint amount);
    event Exited(address user, uint stakeId, uint amount);
    event PoolDrawn(uint refPoolAmount, uint sponsorPoolAmount);
}

// File: contracts/PercentageCalculator.sol





contract PercentageCalculator {
    using SafeMath for uint;

    uint public constant PERCENT_MULTIPLIER = 10000;

    function _calcPercentage(uint amount, uint basisPoints) internal pure returns (uint) {
        require(basisPoints >= 0);
        return amount.mul(basisPoints).div(PERCENT_MULTIPLIER);
    }

    function _calcBasisPoints(uint base, uint interest) internal pure returns (uint) {
        return interest.mul(PERCENT_MULTIPLIER).div(base);
    }
}

// File: contracts/utils/Utils.sol



contract Utils {
    using SafeMath for uint;

    uint public constant DAY = 86400; // Seconds in a day

    function _calcDays(uint start, uint end) internal pure returns (uint) {
        return end.sub(start).div(DAY);
    }
}

// File: contracts/Constants.sol



contract Constants {
    uint public constant MAX_CONTRACT_REWARD_BP = 37455; // 374.55%

    uint public constant LP_FEE_BP = 500; // 5%
    uint public constant REF_COMMISSION_BP = 800; // 8%

    // Ref and sponsor pools
    uint public constant REF_POOL_FEE_BP = 50; // 0.5%, goes to ref pool from each deposit
    uint public constant SPONSOR_POOL_FEE_BP = 50; // 0.5%, goes to sponsor pool from each deposit

    uint public constant EXIT_PENALTY_BP = 5000; // 50%, deduct from user's initial deposit on exit

    // Contract bonus
    uint public constant MAX_CONTRACT_BONUS_BP = 300; // maximum bonus a user can get 3%
    uint public constant CONTRACT_BONUS_UNIT = 250;    // For each 250 token balance of contract, gives
    uint public constant CONTRACT_BONUS_PER_UNIT_BP = 1; // 0.01% extra interest

    // Hold bonus
    uint public constant MAX_HOLD_BONUS_BP = 100; // Maximum 1% hold bonus
    uint public constant HOLD_BONUS_UNIT = 43200; // 12 hours
    uint public constant HOLD_BONUS_PER_UNIT_BP = 2; // 0.02% hold bonus for each 12 hours of hold

    uint public constant REWARD_THRESHOLD_BP = 300; // User will only get hold bonus if his rewards are more then 3% of his deposit

    uint public constant MAX_WITHDRAWAL_OVER_REWARD_THRESHOLD_BP = 300; // Max daily withdrawal limit if user is above REWARD_THRESHOLD_BP

    uint public constant DEV_FEE_BP = 500; // 5%
}

// File: contracts/StatsVars.sol




contract StatsVars {
    // Stats
    uint public totalDepositRewards;
    uint public totalExited;
}

// File: contracts/SharedVariables.sol









contract SharedVariables is Constants, StatsVars, Events, PercentageCalculator, InterestCalculator, Utils {
    IERC20 public fourRXToken;
    uint public fourRXTokenDecimals;

    address public devAddress = 0x64B8cb4C04Ba902010856d913B4e5DF940748Bf2; // Dummy address replace it for prod/dev

    struct Stake {
        uint8 id;
        bool active;
        bool optInInsured; // Is insured ???

        uint32 holdFrom; // Timestamp from which hold should be counted
        uint32 interestCountFrom; // TimeStamp from which interest should be counted, from the beginning
        uint32 lastWithdrawalAt; // date time of last withdrawals so we don't allow more then 3% a day

        uint deposit; // Initial Deposit
        uint withdrawn; // Total withdrawn from this stake
        uint penalty; // Total penalty on this stale

        uint rewards;
    }

    struct User {
        address wallet; // Wallet Address
        Stake[] stakes;
    }

    mapping (address => User) public users;

    uint[] public refPoolBonuses;
    uint[] public sponsorPoolBonuses;

    uint public maxContractBalance;

    uint16 public poolCycle;
    uint32 public poolDrewAt;

    uint public refPoolBalance;
    uint public sponsorPoolBalance;

    uint public devBalance;
}

// File: contracts/libs/SortedLinkedList.sol





library SortedLinkedList {
    using SafeMath for uint;

    struct Item {
        address user;
        uint16 next;
        uint8 id;
        uint score;
    }

    uint16 internal constant GUARD = 0;

    function addNode(Item[] storage items, address user, uint score, uint8 id) internal {
        uint16 prev = findSortedIndex(items, score);
        require(_verifyIndex(items, score, prev));
        items.push(Item(user, items[prev].next, id, score));
        items[prev].next = uint16(items.length.sub(1));
    }

    function updateNode(Item[] storage items, address user, uint score, uint8 id) internal {
        (uint16 current, uint16 oldPrev) = findCurrentAndPrevIndex(items, user, id);
        require(items[oldPrev].next == current);
        require(items[current].user == user);
        require(items[current].id == id);
        score = score.add(items[current].score);
        items[oldPrev].next = items[current].next;
        addNode(items, user, score, id);
    }

    function initNodes(Item[] storage items) internal {
        items.push(Item(address(0), 0, 0, 0));
    }

    function _verifyIndex(Item[] storage items, uint score, uint16 prev) internal view returns (bool) {
        return prev == GUARD || (score <= items[prev].score && score > items[items[prev].next].score);
    }

    function findSortedIndex(Item[] storage items, uint score) internal view returns(uint16) {
        Item memory current = items[GUARD];
        uint16 index = GUARD;
        while(current.next != GUARD && items[current.next].score > score) {
            index = current.next;
            current = items[current.next];
        }

        return index;
    }

    function findCurrentAndPrevIndex(Item[] storage items, address user, uint8 id) internal view returns (uint16, uint16) {
        Item memory current = items[GUARD];
        uint16 currentIndex = GUARD;
        uint16 prevIndex = GUARD;
        while(current.next != GUARD && !(current.user == user && current.id == id)) {
            prevIndex = currentIndex;
            currentIndex = current.next;
            current = items[current.next];
        }

        return (currentIndex, prevIndex);
    }

    function isInList(Item[] storage items, address user, uint8 id) internal view returns (bool) {
        Item memory current = items[GUARD];
        bool exists = false;

        while(current.next != GUARD ) {
            if (current.user == user && current.id == id) {
                exists = true;
                break;
            }
            current = items[current.next];
        }

        return exists;
    }
}

// File: contracts/Pools/SponsorPool.sol



contract SponsorPool {
    SortedLinkedList.Item[] public sponsorPoolUsers;

    function _addSponsorPoolRecord(address user, uint amount, uint8 stakeId) internal {
        SortedLinkedList.addNode(sponsorPoolUsers, user, amount, stakeId);
    }

    function _cleanSponsorPoolUsers() internal {
        delete sponsorPoolUsers;
        SortedLinkedList.initNodes(sponsorPoolUsers);
    }
}

// File: contracts/Pools/ReferralPool.sol


contract ReferralPool {

    SortedLinkedList.Item[] public refPoolUsers;

    function _addRefPoolRecord(address user, uint amount, uint8 stakeId) public {
        if (!SortedLinkedList.isInList(refPoolUsers, user, stakeId)) {
            SortedLinkedList.addNode(refPoolUsers, user, amount, stakeId);
        } else {
            SortedLinkedList.updateNode(refPoolUsers, user, amount, stakeId);
        }
    }

    function _cleanRefPoolUsers() public {
        delete refPoolUsers;
        SortedLinkedList.initNodes(refPoolUsers);
    }
}

// File: contracts/Pools.sol







contract Pools is SponsorPool, ReferralPool, SharedVariables {

    uint8 public constant MAX_REF_POOL_USERS = 12;
    uint8 public constant MAX_SPONSOR_POOL_USERS = 10;

    function _resetPools() internal {
        _cleanSponsorPoolUsers();
        _cleanRefPoolUsers();
        delete refPoolBalance;
        delete sponsorPoolBalance;
        poolDrewAt = uint32(block.timestamp);
        poolCycle++;
    }

    function _updateSponsorPoolUsers(User memory user, Stake memory stake) internal {
        _addSponsorPoolRecord(user.wallet, stake.deposit, stake.id);
    }

    // Reorganise top ref-pool users to draw pool for
    function _updateRefPoolUsers(User memory uplinkUser , Stake memory stake, uint8 uplinkUserStakeId) internal {
        _addRefPoolRecord(uplinkUser.wallet, stake.deposit, uplinkUserStakeId);
    }

    function drawPool() public {
        if (block.timestamp > poolDrewAt + 1 days) {

            SortedLinkedList.Item memory current = refPoolUsers[0];
            uint16 i = 0;

            while (i < MAX_REF_POOL_USERS && current.next != SortedLinkedList.GUARD) {
                current = refPoolUsers[current.next];
                users[current.user].stakes[current.id].rewards = users[current.user].stakes[current.id].rewards.add(_calcPercentage(refPoolBalance, refPoolBonuses[i]));
                i++;
            }

            current = sponsorPoolUsers[0];
            i = 0;

            while (i < MAX_SPONSOR_POOL_USERS && current.next != SortedLinkedList.GUARD) {
                current = sponsorPoolUsers[current.next];
                users[current.user].stakes[current.id].rewards = users[current.user].stakes[current.id].rewards.add(_calcPercentage(sponsorPoolBalance, sponsorPoolBonuses[i]));
                i++;
            }

            emit PoolDrawn(refPoolBalance, sponsorPoolBalance);

            _resetPools();
        }
    }

    // pool info getters

    function getPoolInfo() external view returns (uint32, uint16, uint, uint) {
        return (poolDrewAt, poolCycle, sponsorPoolBalance, refPoolBalance);
    }

    function getPoolParticipants() external view returns (address[] memory, uint8[] memory, uint[] memory, address[] memory, uint8[] memory, uint[] memory) {
        address[] memory sponsorPoolUsersAddresses = new address[](MAX_SPONSOR_POOL_USERS);
        uint8[] memory sponsorPoolUsersStakeIds = new uint8[](MAX_SPONSOR_POOL_USERS);
        uint[] memory sponsorPoolUsersAmounts = new uint[](MAX_SPONSOR_POOL_USERS);

        address[] memory refPoolUsersAddresses = new address[](MAX_REF_POOL_USERS);
        uint8[] memory refPoolUsersStakeIds = new uint8[](MAX_REF_POOL_USERS);
        uint[] memory refPoolUsersAmounts = new uint[](MAX_REF_POOL_USERS);

        uint16 i = 0;
        SortedLinkedList.Item memory current = sponsorPoolUsers[i];

        while (i < MAX_SPONSOR_POOL_USERS && current.next != SortedLinkedList.GUARD) {
            current = sponsorPoolUsers[current.next];
            sponsorPoolUsersAddresses[i] = current.user;
            sponsorPoolUsersStakeIds[i] = current.id;
            sponsorPoolUsersAmounts[i] = current.score;
            i++;
        }

        i = 0;
        current = refPoolUsers[i];

        while (i < MAX_REF_POOL_USERS && current.next != SortedLinkedList.GUARD) {
            current = refPoolUsers[current.next];
            refPoolUsersAddresses[i] = current.user;
            refPoolUsersStakeIds[i] = current.id;
            refPoolUsersAmounts[i] = current.score;
            i++;
        }

        return (sponsorPoolUsersAddresses, sponsorPoolUsersStakeIds, sponsorPoolUsersAmounts, refPoolUsersAddresses, refPoolUsersStakeIds, refPoolUsersAmounts);
    }
}
