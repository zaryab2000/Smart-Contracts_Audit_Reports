// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// BirdFarm is the master of RewardToken. He can make RewardToken and he is a fair guy.
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once REWARD_TOKEN is sufficiently
// distributed and the community can show to govern itself.
//
// Have fun reading it. Hopefully it's bug-free. God bless.

/// @title Farming service for pool tokens
/// @author Bird Money
/// @notice You can use this contract to deposit pool tokens and get rewards
/// @dev Admin can add a new Pool, users can deposit pool tokens, harvestReward, withdraw pool tokens
contract BirdFarm is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many pool tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 reward; // Reward to be given to user
        //
        // We do some fancy math here. Basically, any point in time, the amount of REWARD_TOKENs
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accRewardTokenPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws pool tokens to a pool. Here's what happens:
        //   1. The pool's `accRewardTokenPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 poolToken; // Address of pool token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. REWARD_TOKENs to distribute per block.
        uint256 lastRewardBlock; // Last block number that REWARD_TOKENs distribution occurs.
        uint256 accRewardTokenPerShare; // Accumulated REWARD_TOKENs per share, times 1e12. See below.
    }

    /// @dev The REWARD_TOKEN TOKEN!
    IERC20 public rewardToken;

    /// @dev Block number when bonus REWARD_TOKEN period ends.
    uint256 public bonusEndBlock = 0;

    /// @notice REWARD_TOKEN tokens created per block.
    /// @dev its equal to approx 1000 reward tokens per day
    uint256 public rewardPerBlock = 0.15 ether;

    // Bonus muliplier for early rewardToken makers.
    uint256 private constant BONUS_MULTIPLIER = 10;

    /// @dev Info of each pool.
    PoolInfo[] public poolInfo;

    /// @dev Info of each user that stakes pool tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    /// @dev Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;

    /// @dev The block number when REWARD_TOKEN mining starts.
    uint256 public startBlock = 0;

    /// @dev The block number when REWARD_TOKEN mining ends.
    uint256 public endBlock = 0;

    /// @notice user can get reward and unstake after this time only.
    /// @dev No unstake froze time initially, if needed it can be added and informed to community.
    uint256 public usersCanUnstakeAtTime = 0 seconds;

    /// @dev No reward froze time initially, if needed it can be added and informed to community.
    uint256 public usersCanHarvestAtTime = 0 seconds;

    // to store only unique pool tokens in pools
    mapping(IERC20 => bool) private uniqueTokenInPool;

    /// @dev when some one deposits pool tokens to contract
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);

    /// @dev when some one withdraws pool tokens from contract
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);

    /// @dev when some one harvests reward tokens from contract
    event Harvest(address indexed user, uint256 indexed pid, uint256 amount);

    /// @dev when some one do EMERGENCY withdraw of pool tokens from contract
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(IERC20 _rewardToken) public {
        rewardToken = _rewardToken;
    }

    /// @notice gets total number of pools
    /// @return total number of pools
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /// @notice This adds a new pool. Can only be called by the owner.
    /// @dev Only adds unique pool token
    /// @param _allocPoint The weight of this pool. The more it is the more percentage of reward per block it will get for its users with respect to other pools. But the total reward per block remains same.
    /// @param _poolToken The Liquidity Pool Token of this pool
    /// @param _withUpdate if true then it updates the reward tokens to be given for each of the tokens staked
    function add(
        uint256 _allocPoint,
        IERC20 _poolToken,
        bool _withUpdate
    ) external onlyOwner {
        require(!uniqueTokenInPool[_poolToken], "Token already added");
        uniqueTokenInPool[_poolToken] = true;

        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock =
            block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                poolToken: _poolToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accRewardTokenPerShare: 0
            })
        );
    }

    /// @notice Update the given pool's REWARD_TOKEN pool weight. Can only be called by the owner.
    /// @dev it can change alloc point (weight of pool) with repect to other pools
    /// @param _pid pool id
    /// @param _allocPoint The weight of this pool. The more it is the more percentage of reward per block it will get for its users with respect to other pools. But the total reward per block remains same.
    /// @param _withUpdate if true then it updates the reward tokens to be given for each of the tokens staked
    function setAllocPoint(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) external onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    // Return number of blocks between _from to _to block which are applicable for reward tokens. if multiplier returns 10 blocks then 10 * reward per block = 50 coins to be given as reward. equally to community. with repect to pool weight.
    function getMultiplier(uint256 _from, uint256 _to)
        internal
        view
        returns (uint256)
    {
        uint256 from = _from;
        uint256 to = _to;
        if (endBlock < from) from = endBlock;
        if (endBlock < to) to = endBlock;
        if (to < startBlock) return 0;
        if (from < startBlock && startBlock < to) from = startBlock;

        if (to <= bonusEndBlock) {
            return to.sub(from).mul(BONUS_MULTIPLIER);
        } else if (from >= bonusEndBlock) {
            return to.sub(from);
        } else {
            return
                bonusEndBlock.sub(from).mul(BONUS_MULTIPLIER).add(
                    to.sub(bonusEndBlock)
                );
        }
    }

    /// @notice get reward tokens to show on UI
    /// @dev calculates reward tokens of a user with repect to pool id
    /// @param _pid the pool id
    /// @param _user the user who is calls this function
    /// @return pending reward tokens of a user
    function pendingRewardToken(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accRewardTokenPerShare = pool.accRewardTokenPerShare;
        uint256 poolSupply = pool.poolToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && poolSupply != 0) {
            uint256 multiplier =
                getMultiplier(pool.lastRewardBlock, block.number);
            uint256 rewardTokenReward =
                multiplier.mul(rewardPerBlock).mul(pool.allocPoint).div(
                    totalAllocPoint
                );
            accRewardTokenPerShare = accRewardTokenPerShare.add(
                rewardTokenReward.mul(1e12).div(poolSupply)
            );
        }
        return
            user.reward.add(
                user.amount.mul(accRewardTokenPerShare).div(1e12).sub(
                    user.rewardDebt
                )
            );
    }

    /// @notice Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    uint256 private stakedTokens = 0;

    /// @notice Update reward variables of the given pool to be up-to-date.
    /// @param _pid the pool id
    function updatePool(uint256 _pid) public {
        if (stakedTokens == 0) configTheEndRewardBlock(); // to stop making reward when reward tokens are empty in BirdFarm

        PoolInfo storage pool = poolInfo[_pid];

        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 poolSupply = pool.poolToken.balanceOf(address(this));
        if (poolSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 rewardTokenReward =
            multiplier.mul(rewardPerBlock).mul(pool.allocPoint).div(
                totalAllocPoint
            );
        pool.accRewardTokenPerShare = pool.accRewardTokenPerShare.add(
            rewardTokenReward.mul(1e12).div(poolSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    /// @notice deposit tokens to get rewards
    /// @dev deposit pool tokens to BirdFarm for reward tokens allocation.
    /// @param _pid pool id
    /// @param _amount how many tokens you want to stake
    function deposit(uint256 _pid, uint256 _amount) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(_amount > 0, "Must deposit amount more than zero.");

        updatePool(_pid);

        uint256 pending =
            user.amount.mul(pool.accRewardTokenPerShare).div(1e12).sub(
                user.rewardDebt
            );
        user.reward += pending;

        pool.poolToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );
        stakedTokens += _amount;
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accRewardTokenPerShare).div(
            1e12
        );
        emit Deposit(msg.sender, _pid, _amount);
    }

    /// @notice get the tokens back from BardFarm
    /// @dev withdraw or unstake pool tokens from BidFarm
    /// @param _pid pool id
    /// @param _amount how many pool tokens you want to unstake
    function withdraw(uint256 _pid, uint256 _amount) external {
        require(_amount > 0, "Must withdraw amount more than zero.");
        require(
            now > usersCanUnstakeAtTime,
            "Can not withdraw/unstake at this time."
        );
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(
            user.amount >= _amount,
            "You do not have enough pool tokens staked."
        );
        updatePool(_pid);
        uint256 pending =
            user.amount.mul(pool.accRewardTokenPerShare).div(1e12).sub(
                user.rewardDebt
            );
        user.reward += pending;

        stakedTokens -= _amount;
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accRewardTokenPerShare).div(
            1e12
        );
        pool.poolToken.safeTransfer(address(msg.sender), _amount);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    /// @notice harvest reward tokens from BardFarm
    /// @dev harvest reward tokens from BidFarm and update pool variables
    /// @param _pid pool id
    function harvest(uint256 _pid) external {
        require(now > usersCanHarvestAtTime, "Can not harvest at this time.");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        uint256 pending =
            user.amount.mul(pool.accRewardTokenPerShare).div(1e12).sub(
                user.rewardDebt
            );
        user.reward += pending;
        uint256 rewardToGiveNow = user.reward;
        user.reward = 0;

        user.rewardDebt = user.amount.mul(pool.accRewardTokenPerShare).div(
            1e12
        );

        rewardToken.safeTransfer(msg.sender, rewardToGiveNow);
        emit Harvest(msg.sender, _pid, pending);
    }

   
    function configTheEndRewardBlock() internal {
        endBlock = block.number.add(
            (rewardToken.balanceOf(address(this)).div(rewardPerBlock))
        );
    }

    /// @notice owner puts reward tokens in contract
    /// @dev owner can add reward token to contract so that it can be distributed to users
    /// @param _amount amount of reward tokens
    function addRewardTokensToContract(uint256 _amount) external onlyOwner {
        uint256 rewardEndsInBlocks = _amount.div(rewardPerBlock);

        uint256 lastEndBlock = endBlock == 0 ? block.number : endBlock;
        endBlock = lastEndBlock + rewardEndsInBlocks;

        require(
            rewardToken.transferFrom(msg.sender, address(this), _amount),
            "Error in adding reward tokens in contract."
        );
        emit EndRewardBlockChanged(endBlock);
    }

    event AddedRewardTokensToContract(uint256 amount);

    /// @notice owner can change reward token
    /// @dev owner can set reward token
    /// @param _rewardToken the token in which rewards are given
    function setRewardToken(IERC20 _rewardToken) external onlyOwner {
        rewardToken = _rewardToken;
        emit RewardTokenChanged(_rewardToken);
    }

    /// @dev When reward token changes
    /// @param rewardToken the token in which rewards are given
    event RewardTokenChanged(IERC20 rewardToken);

    /// @notice owner can change unstake frozen time
    /// @dev owner can set unstake frozen time
    /// @param _usersCanUnstakeAtTime the block at which user can unstake
    function setUnstakeFrozenTime(uint256 _usersCanUnstakeAtTime)
        external
        onlyOwner
    {
        usersCanUnstakeAtTime = _usersCanUnstakeAtTime;
        emit UnstakeFrozenTimeChanged(_usersCanUnstakeAtTime);
    }

    /// @dev When Unstake Frozen Time Changed
    /// @param usersCanUnstakeAtTime after this time users can unstake
    event UnstakeFrozenTimeChanged(uint256 usersCanUnstakeAtTime);

    /// @notice owner can change reward frozen time
    /// @dev owner can set reward frozen time
    /// @param _usersCanHarvestAtTime the block at which user can harvest reward
    function setRewardFrozenTime(uint256 _usersCanHarvestAtTime)
        external
        onlyOwner
    {
        usersCanHarvestAtTime = _usersCanHarvestAtTime;
        emit RewardFrozenTimeChanged(_usersCanHarvestAtTime);
    }

    /// @dev When Reward Frozen Time Changed
    /// @param usersCanHarvestAtTime after this time users can harvest
    event RewardFrozenTimeChanged(uint256 usersCanHarvestAtTime);

    /// @notice owner can change reward token per block
    /// @dev owner can set reward token per block
    /// @param _rewardPerBlock rewards distributed per block to community or users
    function setRewardTokenPerBlock(uint256 _rewardPerBlock)
        external
        onlyOwner
    {
        rewardPerBlock = _rewardPerBlock;
        emit RewardTokenPerBlockChanged(_rewardPerBlock);
    }

    /// @dev When Reward Token Per Block is changed
    /// @param rewardPerBlock reward tokens made in each block
    event RewardTokenPerBlockChanged(uint256 rewardPerBlock);

    /// @notice owner can change start reward block
    /// @dev owner can set start reward block
    /// @param _startBlock the block at which reward token distribution starts
    function setStartRewardBlock(uint256 _startBlock) external onlyOwner {
        require(
            _startBlock <= endBlock,
            "Start block must be less or equal to end reward block."
        );
        startBlock = _startBlock;
        emit StartRewardBlockChanged(_startBlock);
    }

    /// @dev Start Reward Block Changed
    /// @param startRewardBlock block when rewards are distributed per block to community or users
    event StartRewardBlockChanged(uint256 startRewardBlock);

    /// @notice owner can change end reward block
    /// @dev owner can set end reward block
    /// @param _endBlock the block at which reward token distribution ends
    function setEndRewardBlock(uint256 _endBlock) external onlyOwner {
        require(
            startBlock <= _endBlock,
            "End reward block must be greater or equal to start reward block."
        );
        endBlock = _endBlock;
        emit EndRewardBlockChanged(_endBlock);
    }

    /// @dev End Reward Block Changed
    /// @param endBlock block when rewards are ended to be distributed per block to community or users
    event EndRewardBlockChanged(uint256 endBlock);
}