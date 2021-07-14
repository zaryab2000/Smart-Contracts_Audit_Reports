/**
 *Submitted for verification at BscScan.com on 2021-07-01
*/

pragma solidity ^0.6.0;

interface IUniswapV2Router01 {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        );

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETHWithPermit(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 amountToken, uint256 amountETH);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) external pure returns (uint256 amountB);

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountOut);

    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountIn);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}
// import ierc20 & safemath & non-standard
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

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

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }
}

// interface INonStandardERC20 {
//     function totalSupply() external view returns (uint256);

//     function balanceOf(address owner) external view returns (uint256 balance);

//     ///
//     /// !!!!!!!!!!!!!!
//     /// !!! NOTICE !!! `transfer` does not return a value, in violation of the ERC-20 specification
//     /// !!!!!!!!!!!!!!
//     ///

//     function transfer(address dst, uint256 amount) external;

//     ///
//     /// !!!!!!!!!!!!!!
//     /// !!! NOTICE !!! `transferFrom` does not return a value, in violation of the ERC-20 specification
//     /// !!!!!!!!!!!!!!
//     ///

//     function transferFrom(
//         address src,
//         address dst,
//         uint256 amount
//     ) external;

//     function approve(address spender, uint256 amount)
//         external
//         returns (bool success);

//     function allowance(address owner, address spender)
//         external
//         view
//         returns (uint256 remaining);

//     event Transfer(address indexed from, address indexed to, uint256 amount);
//     event Approval(
//         address indexed owner,
//         address indexed spender,
//         uint256 amount
//     );
// }

abstract contract Context {
    function _msgSender() internal virtual view returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal virtual view returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() internal {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

contract aqarchain is Ownable{
     using SafeMath for uint256;
     
     // Info of each user in seed,public and private .
     
    struct seedUserInfo {
        uint256 amount;    
        uint256 phase; 
        string aqarid;
        string modeofpayment;
    }
     struct privateUserInfo {
        uint256 amount;    
        uint256 phase; 
        string aqarid;
        string modeofpayment;
    }
     struct publicUserInfo {
        uint256 amount;    
        uint256 phase; 
        string aqarid;
        string modeofpayment;
    }
    //aqar token address
      IERC20 public token;
      
      //useraddress input toh you will get userinfo
      mapping (address => seedUserInfo) public usermapseed;
      mapping (address => privateUserInfo) public usermapprivate;
      mapping (address => publicUserInfo) public usermappublic;
      
      // aqar id to get amount invested
      mapping (string => uint256) public amountmaptouserseed;
      mapping (string => uint256) public amountmaptouserprivate;
      mapping (string => uint256) public amountmaptouserpublic;
      
      //count of total transactions
      uint256 public i=0;
      

      
      // prices of various rounds
      uint256 public seedprice = 55;
      uint256 public privateprice = 4;
      uint256 public publicprice = 2857;
      
      //soldout amount
      uint256 public seedamount;
      uint256 public privateamount;
      uint256 public publicamount;
      
      // variables to turn on and off private and public functions
      bool public seedrun = false;
      bool public privaterun = false;
      bool public publicrun = false;
      bool public claimbool = false;
      
      //all addresses
      address[] public usersarr;
      
      // usdt address
      IERC20 private usdt = IERC20(0x55d398326f99059fF775485246999027B3197955);
      
       //router to get bnb price
       IUniswapV2Router01 pancakerouter1;
    
      constructor() public {
        pancakerouter1 = IUniswapV2Router01(
            0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F
        );
    }
      address[] private arr = [
        0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c, //WBNB
        0x55d398326f99059fF775485246999027B3197955 //usdt
    ];

    function getBnbRate() public view returns (uint256) {
        uint256[] memory amounts = pancakerouter1.getAmountsOut(1e18, arr);
        return amounts[1];
    }
    function settoken(address _token)external onlyOwner{
        token = IERC20(_token);
    }
    function seedusdt(string calldata _id, uint256 _amount)  external returns (string memory aqarid){
        require(_amount>=100 ether ,"Enter amount greater than 100 usd");
        require(seedrun == true,"seed round is not started or over");
        require(seedamount.add(_amount.mul(seedprice).div(10))<=10000000 ether,"Sale completed");

       
        usdt.transferFrom(msg.sender,address(this), _amount);
        usermapseed[msg.sender]=seedUserInfo({amount: usermapseed[msg.sender].amount.add(_amount.mul(seedprice).div(10)),phase:seedprice,aqarid:_id,modeofpayment:"USDT"});
        amountmaptouserseed[_id]=amountmaptouserseed[_id].add(_amount.mul(seedprice).div(10));
        seedamount=seedamount.add(_amount.mul(seedprice).div(10));
        i++;
        usersarr.push(msg.sender);
      
    }
    
      function seedbnb(string calldata _id) external payable {
        // user enter amount of ether which is then transfered into the smart contract and tokens to be given is saved in the mapping
        require(
            msg.value.mul(getBnbRate()).div(1e18) >= 100 ether,
            "the input bnb amount should be greater than hundred"
        );
        require(seedrun == true,"seed round is not started or over");
        require(seedamount.add(msg.value.mul(getBnbRate()).mul(seedprice).div(10).div(1e18))<=10000000 ether,"sale completed");
      

        usermapseed[msg.sender]=seedUserInfo({amount:usermapseed[msg.sender].amount.add(msg.value.mul(getBnbRate()).mul(seedprice).div(1e18)),phase:seedprice,aqarid:_id,modeofpayment:"BNB"});
        amountmaptouserseed[_id]=amountmaptouserseed[_id].add(msg.value.mul(getBnbRate()).mul(seedprice).div(1e18));
        seedamount=seedamount.add(msg.value.mul(getBnbRate()).mul(seedprice).div(1e18));
        i++;
        usersarr.push(msg.sender);
     
    }
     function privateusdt(string calldata _id, uint256 _amount)  external returns (string memory aqarid){
        require(_amount>=100 ether,"Enter amount greter than 100 usd");
        require(privaterun==true,"Private sale haven't started yet");
        require(privateamount.add(_amount.mul(privateprice))<=12200000 ether,"Sale completed");
                
       
        usermapprivate[msg.sender]=privateUserInfo({amount:usermapprivate[msg.sender].amount.add(_amount.mul(privateprice)),phase:privateprice,aqarid:_id,modeofpayment:"USDT"});
        amountmaptouserprivate[_id]= amountmaptouserprivate[_id].add(_amount.mul(privateprice));
        usdt.transferFrom(msg.sender,address(this), _amount);
        privateamount=privateamount.add(_amount.mul(privateprice));
        i++;
        usersarr.push(msg.sender);
       
    }
      function privatebnb(string calldata _id) external payable {
        // user enter amount of ether which is then transfered into the smart contract and tokens to be given is saved in the mapping
       require(
           msg.value.mul(getBnbRate()).div(1e18) >= 100 ether ,
            "the input bnb amount should be greater than hundred usd"
        );
        require(privaterun==true,"Private sale haven't started yet");
        require(privateamount.add(msg.value.mul(getBnbRate()).mul(privateprice).div(1e18))<=12200000 ether,"sale completed");
        
     
        usermapprivate[msg.sender]=privateUserInfo({amount:usermapprivate[msg.sender].amount.add(msg.value.mul(getBnbRate()).mul(privateprice).div(1e18)),phase:privateprice,aqarid:_id,modeofpayment:"BNB"});
        amountmaptouserprivate[_id]=amountmaptouserprivate[_id].add(msg.value.mul(getBnbRate()).mul(privateprice).div(1e18));
        privateamount=privateamount.add(msg.value.mul(getBnbRate()).mul(privateprice).div(1e18));
        i++;
        usersarr.push(msg.sender);
      
    }
    
     function publicusdt(string calldata _id, uint256 _amount)  external returns (string memory aqarid){
         require(_amount>=100 ether ,"Enter amount more than 100 usd");
         require(publicrun==true,"Public sale haven't started yet");
         require((publicamount.add(_amount.mul(publicprice).div(1000))<=300000 ether),"sale completed");
        
        usermappublic[msg.sender]=publicUserInfo({amount:usermappublic[msg.sender].amount.add(_amount.mul(publicprice).div(1000)),phase:publicprice,aqarid:_id,modeofpayment:"usdt"});
        amountmaptouserpublic[_id]=amountmaptouserpublic[_id].add(_amount.mul(publicprice).div(1000));
        usdt.transferFrom(msg.sender,address(this), _amount);
        publicamount=publicamount.add(_amount.mul(publicprice).div(1000));
        i++;
        usersarr.push(msg.sender);
     
    }
    function publicbnb(string calldata _id) external payable {
        // user enter amount of ether which is then transfered into the smart contract and tokens to be given is saved in the mapping
        require(
             msg.value.mul(getBnbRate()).div(1e18) >= 100 ether ,
            "the input bnb amount should be greater than hundred and less than sfivethousand"
        );
        require(publicrun==true,"Public sale haven't started yet");
        require(publicamount.add(msg.value.mul(getBnbRate()).mul(publicprice).div(1e18).div(1000))<=300000 ether,"sale completed");
     
     
        usermappublic[msg.sender]=publicUserInfo({amount:usermappublic[msg.sender].amount.add(msg.value.mul(getBnbRate()).mul(publicprice).div(1e18).div(1000)),phase:publicprice,aqarid:_id,modeofpayment:"BNB"});
        amountmaptouserpublic[_id]=amountmaptouserpublic[_id].add(msg.value.mul(getBnbRate()).mul(publicprice).div(1e18).div(1000));
        publicamount=publicamount.add(msg.value.mul(getBnbRate()).mul(publicprice).div(1e18).div(1000));
        i++;
        usersarr.push(msg.sender);
       
    }
    function claim() external {
        require(claimbool == true,"claiming amount should be true");
       
       uint256 claimamount = usermappublic[msg.sender].amount.add(usermapseed[msg.sender].amount).add(usermapprivate[msg.sender].amount);
        token.transfer(msg.sender,claimamount);
        usermappublic[msg.sender].amount=0;
        usermapprivate[msg.sender].amount=0;
        usermapseed[msg.sender].amount=0;
        claimamount=0;
    }
    
    function privatemapseed(address _address,uint256 _amount,string calldata _aqarid) external onlyOwner{
        usermapseed[_address] = seedUserInfo({amount:_amount,phase:seedprice,aqarid:_aqarid,modeofpayment:"privateseed"});
        amountmaptouserseed[_aqarid] = _amount;
    }
     function privatemapprivate(address _address,uint256 _amount,string calldata _aqarid) external onlyOwner{
        usermapprivate[_address] = privateUserInfo({amount:_amount,phase:privateprice,aqarid:_aqarid,modeofpayment:"privateprivate"});
        amountmaptouserprivate[_aqarid] = _amount;
    }
     function privatemappublic(address _address,uint256 _amount,string calldata _aqarid) external onlyOwner{
        usermappublic[_address] = publicUserInfo({amount:_amount,phase:publicprice,aqarid:_aqarid,modeofpayment:"privatepublic"});
        amountmaptouserpublic[_aqarid] = _amount;
    }
    function toggleclaim() external onlyOwner  {
        claimbool = !claimbool;
    }
    function toggleseed() external onlyOwner  {
        seedrun = !seedrun;
    }
     function toggleprivate() external onlyOwner {
        privaterun = !privaterun;
    }
      function togglepublic() external onlyOwner  {
        publicrun = !publicrun;
    }
    
     function getBnbBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function adminTransferBnbFund() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function getContractTokenBalance(IERC20 _token)
        public
        view
        returns (uint256)
    {
        return _token.balanceOf(address(this));
    }

    function fundsWithdrawal(IERC20 _token, uint256 value) external onlyOwner {
        require(
            getContractTokenBalance(_token) >= value,
            "the contract doesnt have tokens"
        );
        
      _token.transfer(msg.sender,value);

    }
    
  
}
