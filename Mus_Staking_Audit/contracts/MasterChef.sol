pragma solidity 0.6.12;

import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/IBEP20.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/SafeBEP20.sol";
import "@pancakeswap/pancake-swap-lib/contracts/access/Ownable.sol";

import "./MuseToken.sol";
import "./SyrupBar.sol";

interface IDefiERC20 {
    function claimReward() external returns (uint256 userReward);

    function rewardOf(address account) external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
}

// import "@nomiclabs/buidler/console.sol";

interface IDefiWrap {
    function erc20ImplementationOf(address erc20)
        external
        view
        returns (address);
}

interface IMigratorChef {
    // Perform LP token migration from legacy PancakeSwap to MuseSwap.
    // Take the current LP token address and return the new LP token address.
    // Migrator should have full access to the caller's LP token.
    // Return the new LP token address.
    //
    // XXX Migrator must have allowance access to PancakeSwap LP tokens.
    // MuseSwap must mint EXACTLY the same amount of MuseSwap LP tokens or
    // else something bad will happen. Traditional PancakeSwap does not
    // do that so be careful!
    function migrate(IBEP20 token) external returns (IBEP20);
}

// MasterChef is the master of Muse. He can make Muse and he is a fair guy.
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once CAKE is sufficiently
// distributed and the community can show to govern itself.
//
// Have fun reading it. Hopefully it's bug-free. God bless.
contract MasterChef is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 point; // poin to calculate reward

        //
        // We do some fancy math here. Basically, any point in time, the amount of CAKEs
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accMusePerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accMusePerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IBEP20 lpToken; // Address of LP token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. CAKEs to distribute per block.
        uint256 lastRewardBlock; // Last block number that CAKEs distribution occurs.
        uint256 accMusePerShare; // Accumulated CAKEs per share, times 1e12. See below.
        uint256 mintedPoint;
        bool isWrapped; // true if it's kinda wrapped mada token, else => false
        uint256 totalClaimedReward; // how many reward have all users already claimed
    }

    // The CAKE TOKEN!
    MuseToken public muse;
    // The SYRUP TOKEN!
    SyrupBar public syrup;
    // Dev address.
    // address public devaddr;
    // CAKE tokens created per block.
    uint256 public cakePerBlock;
    // Bonus muliplier for early muse makers.
    uint256 public BONUS_MULTIPLIER = 1;
    // The migrator contract. It has a lot of power. Can only be set through governance (owner).
    IMigratorChef public migrator;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when CAKE mining starts.
    uint256 public startBlock;

    address private wrappedContract;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(
        MuseToken _cake,
        SyrupBar _syrup,
        // address _devaddr,
        uint256 _cakePerBlock,
        uint256 _startBlock,
        address _wrap
    ) public {
        muse = _cake;
        syrup = _syrup;
        // devaddr = _devaddr;
        cakePerBlock = _cakePerBlock;
        startBlock = _startBlock;
        wrappedContract = _wrap;

        // staking pool
        // poolInfo.push(PoolInfo({
        //     lpToken: _cake,
        //     allocPoint: 1000,
        //     lastRewardBlock: startBlock,
        //     accMusePerShare: 0
        // }));

        // totalAllocPoint = 1000;
    }

    function updateMultiplier(uint256 multiplierNumber) public onlyOwner {
        BONUS_MULTIPLIER = multiplierNumber;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(
        uint256 _allocPoint,
        IBEP20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        bool iswrap;

        if (
            IDefiWrap(wrappedContract).erc20ImplementationOf(
                address(_lpToken)
            ) == address(0)
        ) {
            iswrap = true;
        }

        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accMusePerShare: 0,
                mintedPoint: 1,
                isWrapped: iswrap,
                totalClaimedReward: 0
            })
        );
        updateStakingPool();
    }

    // Update the given pool's CAKE allocation point. Can only be called by the owner.
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 prevAllocPoint = poolInfo[_pid].allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
        if (prevAllocPoint != _allocPoint) {
            totalAllocPoint = totalAllocPoint.sub(prevAllocPoint).add(
                _allocPoint
            );
            updateStakingPool();
        }
    }

    function updateStakingPool() internal {
        uint256 length = poolInfo.length;
        uint256 points = 0;
        for (uint256 pid = 1; pid < length; ++pid) {
            points = points.add(poolInfo[pid].allocPoint);
        }
        // if (points != 0) {
        //     points = points.div(3);
        //     totalAllocPoint = totalAllocPoint.sub(poolInfo[0].allocPoint).add(points);
        //     poolInfo[0].allocPoint = points;
        // }
    }

    // Set the migrator contract. Can only be called by the owner.
    function setMigrator(IMigratorChef _migrator) public onlyOwner {
        migrator = _migrator;
    }

    // Migrate lp token to another lp contract. Can be called by anyone. We trust that migrator contract is good.
    function migrate(uint256 _pid) public {
        require(address(migrator) != address(0), "migrate: no migrator");
        PoolInfo storage pool = poolInfo[_pid];
        IBEP20 lpToken = pool.lpToken;
        uint256 bal = lpToken.balanceOf(address(this));
        lpToken.safeApprove(address(migrator), bal);
        IBEP20 newLpToken = migrator.migrate(lpToken);
        require(bal == newLpToken.balanceOf(address(this)), "migrate: bad");
        pool.lpToken = newLpToken;
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        return _to.sub(_from).mul(BONUS_MULTIPLIER);
    }

    // View function to see pending CAKEs on frontend.
    function pendingMuse(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accMusePerShare = pool.accMusePerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 cakeReward = multiplier
            .mul(cakePerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);
            accMusePerShare = accMusePerShare.add(
                cakeReward.mul(1e12).div(lpSupply)
            );
        }
        return user.amount.mul(accMusePerShare).div(1e12).sub(user.rewardDebt);
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return 0;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return 0;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 cakeReward = multiplier
        .mul(cakePerBlock)
        .mul(pool.allocPoint)
        .div(totalAllocPoint);
        // muse.mint(devaddr, cakeReward.div(10));
        // muse.mint(address(syrup), cakeReward);
        pool.accMusePerShare = pool.accMusePerShare.add(
            cakeReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;

        return cakeReward;
    }

    // Deposit LP tokens to MasterChef for CAKE allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        // require (_pid != 0, 'deposit CAKE by staking');

        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 treward = updatePool(_pid);
        if (user.amount > 0) {
            uint256 bal = IDefiERC20(address(pool.lpToken)).balanceOf(
                address(this)
            );
            uint256 pending = user
            .amount
            .mul(pool.accMusePerShare)
            .div(1e12)
            .sub(user.rewardDebt);
            if (pending > 0) {
                if (bal >= pending) {
                    // safeMuseTransfer(msg.sender, pending);
                    muse.transfer(msg.sender, pending);
                } else {
                    muse.mint(address(syrup), treward);
                    safeMuseTransfer(msg.sender, pending);
                }
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accMusePerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _amount) public {
        // require (_pid != 0, 'withdraw CAKE by unstaking');
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");

        uint256 treward = updatePool(_pid);
        uint256 bal = IDefiERC20(address(pool.lpToken)).balanceOf(
            address(this)
        );
        uint256 pending = user.amount.mul(pool.accMusePerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            if (bal >= pending) {
                // safeMuseTransfer(msg.sender, pending);
                muse.transfer(msg.sender, pending);
            } else {
                muse.mint(address(syrup), treward);
                safeMuseTransfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accMusePerShare).div(1e12);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Stake wrapped token
    function stakingWrappedToken(uint256 _pid, uint256 _amount) public {
        // require (_pid != 0, 'deposit CAKE by staking');

        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 treward = updatePool(_pid);
        if (user.amount > 0) {
            uint256 bal = IDefiERC20(address(pool.lpToken)).balanceOf(
                address(this)
            );
            uint256 pending = user
            .amount
            .mul(pool.accMusePerShare)
            .div(1e12)
            .sub(user.rewardDebt);
            if (pending > 0) {
                if (bal >= pending) {
                    // safeMuseTransfer(msg.sender, pending);
                    muse.transfer(msg.sender, pending);
                } else {
                    muse.mint(address(syrup), treward);
                    safeMuseTransfer(msg.sender, pending);
                }
            }
        }

        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accMusePerShare).div(1e12);

        ////    update mada variable /////////////////
        uint256 poolReward = IDefiERC20(address(pool.lpToken)).rewardOf(
            address(this)
        );
        uint256 pool_total = IDefiERC20(address(pool.lpToken)).balanceOf(
            address(this)
        ); //.add(poolReward);

        uint256 pool_point_ratio;

        if (pool_total == 0) {
            pool_point_ratio = uint256(1).mul(1e12);
            pool.mintedPoint = _amount.mul(1e12).div(pool_point_ratio);
        } else {
            pool_point_ratio = pool_total.mul(1e12).div(pool.mintedPoint);
            pool.mintedPoint = pool.mintedPoint.add(
                _amount.mul(1e12).div(pool_point_ratio)
            );
        }

        user.point = user.point.add(_amount.mul(1e12).div(pool_point_ratio));
    }

    function _claimReward(uint256 _pid) internal returns (uint256) {
        // require (_pid != 0, 'deposit CAKE by staking');

        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        if (
            IDefiWrap(wrappedContract).erc20ImplementationOf(
                address(pool.lpToken)
            ) == address(0)
        ) {
            return 0;
        }

        uint256 reward;
        if (IDefiERC20(address(pool.lpToken)).rewardOf(address(this)) > 0) {
            reward = IDefiERC20(address(pool.lpToken)).claimReward();
        }

        ////    update mada variable /////////////////
        uint256 poolReward = IDefiERC20(address(pool.lpToken)).rewardOf(
            address(this)
        );
        uint256 pool_total = IDefiERC20(address(pool.lpToken)).balanceOf(
            address(this)
        ); //.add(poolReward);

        if (pool_total == 0) {
            return 0;
        }
        uint256 pool_point_ratio = pool_total.mul(1e12).div(pool.mintedPoint);

        uint256 user_claimable_amount;
        user_claimable_amount = user.point.mul(pool_point_ratio).div(1e12).sub(
            user.amount
        );

        uint256 new_user_point = user.amount.mul(1e12).div(pool_point_ratio);

        pool.mintedPoint = pool.mintedPoint.add(new_user_point).sub(user.point);
        user.point = new_user_point;

        pool.totalClaimedReward = pool.totalClaimedReward.add(
            user_claimable_amount
        );

        bool xfer = IDefiERC20(address(pool.lpToken)).transfer(
            msg.sender,
            user_claimable_amount
        );
        require(xfer == true, "ERR_TRANSFER");
    }

    function unstakingWrappedToken(uint256 _pid, uint256 _amount) public {
        // require (_pid != 0, 'withdraw CAKE by unstaking');
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");

        uint256 treward = updatePool(_pid);
        uint256 bal = IDefiERC20(address(pool.lpToken)).balanceOf(
            address(this)
        );
        uint256 pending = user.amount.mul(pool.accMusePerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            if (bal >= pending) {
                // safeMuseTransfer(msg.sender, pending);
                muse.transfer(msg.sender, pending);
            } else {
                muse.mint(address(syrup), treward);
                safeMuseTransfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accMusePerShare).div(1e12);
        emit Withdraw(msg.sender, _pid, _amount);

        //update wrapped token state
        _claimReward(_pid);
        uint256 pool_total = IDefiERC20(address(pool.lpToken)).balanceOf(
            address(this)
        );

        if (pool_total == 0) {
            return;
        }

        uint256 pool_point_ratio = pool_total.mul(1e12).div(pool.mintedPoint);

        uint256 _tmp = user.amount.mul(1e12).div(pool_point_ratio);

        uint256 _tmpPoint = user.point.sub(_tmp);

        pool.mintedPoint = pool.mintedPoint.sub(_tmpPoint);

        uint256 _tDeposit = user.amount.mul(1e12);
        uint256 _t = _tDeposit.div(pool_point_ratio);
        user.point = _t;
    }

    // estimated MADA rewards from Wrapped
    function getEstimatedReward(uint256 _pid, address _staker)
        external
        view
        returns (uint256)
    {
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo memory user = userInfo[_pid][_staker];

        uint256 poolReward = IDefiERC20(address(pool.lpToken)).rewardOf(
            address(this)
        );
        uint256 pool_total = IDefiERC20(address(pool.lpToken)).balanceOf(
            address(this)
        ); //.add(poolReward);

        uint256 pool_point_ratio = pool_total.mul(1e12).div(pool.mintedPoint);

        uint256 user_claimable_amount;
        user_claimable_amount = user.point.mul(pool_point_ratio).div(1e12).sub(
            user.amount
        );

        return user_claimable_amount;
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    // Safe muse transfer function, just in case if rounding error causes pool to not have enough CAKEs.
    function safeMuseTransfer(address _to, uint256 _amount) internal {
        syrup.safeMuseTransfer(_to, _amount);
    }

    // Update dev address by the previous dev.
    // function dev(address _devaddr) public {
    //     require(msg.sender == devaddr, "dev: wut?");
    //     devaddr = _devaddr;
    // }
}
