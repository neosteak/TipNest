// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TIPStaking
 * @dev Staking contract for TIP tokens with 10% APR rewards
 * @notice Users can stake TIP tokens to earn rewards with a 7-day minimum lock period
 */
contract TIPStaking is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 depositTime;
        uint256 pendingRewards;
    }

    IERC20 public immutable tipToken;
    uint256 public constant REWARD_RATE = 10; // 10% APR
    uint256 public constant MIN_LOCK_PERIOD = 7 days;
    uint256 public constant PENALTY_RATE = 1; // 1% penalty for early withdrawal
    uint256 public constant PRECISION = 1e18;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant MIN_REWARD_THRESHOLD = 1e12; // Minimum rewards to claim (0.000001 TIP)

    mapping(address => UserInfo) public userInfo;
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards, uint256 penalty, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event EmergencyWithdraw(address indexed to, uint256 amount, uint256 timestamp);

    /**
     * @dev Constructor to initialize the staking contract
     * @param _tipToken Address of the TIP token contract
     */
    constructor(address _tipToken) Ownable(msg.sender) {
        require(_tipToken != address(0), "Invalid token address");
        tipToken = IERC20(_tipToken);
    }

    /**
     * @notice Calculate pending rewards for a user
     * @param user Address of the user
     * @return Pending rewards amount
     */
    function pending(address user) public view returns (uint256) {
        UserInfo storage userStake = userInfo[user];
        if (userStake.amount == 0) {
            return userStake.pendingRewards;
        }
        
        uint256 timeElapsed = block.timestamp - userStake.depositTime;
        uint256 newRewards = (userStake.amount * REWARD_RATE * timeElapsed) / (SECONDS_PER_YEAR * 100);
        
        return userStake.pendingRewards + newRewards;
    }

    /**
     * @notice Stake TIP tokens to earn rewards
     * @param amount Amount of TIP tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        
        UserInfo storage userStake = userInfo[msg.sender];
        
        // Calculate and store pending rewards
        if (userStake.amount > 0) {
            userStake.pendingRewards = pending(msg.sender);
        }
        
        // Update state BEFORE external call (Checks-Effects-Interactions pattern)
        userStake.amount += amount;
        userStake.depositTime = block.timestamp;
        totalStaked += amount;
        
        // Transfer tokens from user (external call at the end)
        tipToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Unstake TIP tokens and receive rewards
     * @param amount Amount of TIP tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        UserInfo storage userStake = userInfo[msg.sender];
        require(amount > 0, "Cannot unstake 0");
        require(userStake.amount >= amount, "Insufficient staked amount");
        
        uint256 rewards = pending(msg.sender);
        uint256 penalty = 0;
        
        // Apply penalty if unstaking before minimum lock period
        if (block.timestamp < userStake.depositTime + MIN_LOCK_PERIOD) {
            penalty = (amount * PENALTY_RATE) / 100;
        }
        
        // Update user info
        userStake.amount -= amount;
        userStake.pendingRewards = 0;
        
        if (userStake.amount > 0) {
            userStake.depositTime = block.timestamp;
        } else {
            userStake.depositTime = 0;
        }
        
        totalStaked -= amount;
        totalRewardsDistributed += rewards;
        
        // Transfer tokens back to user (minus penalty)
        uint256 amountToTransfer = amount - penalty + rewards;
        tipToken.safeTransfer(msg.sender, amountToTransfer);
        
        emit Unstaked(msg.sender, amount, rewards, penalty, block.timestamp);
    }

    /**
     * @notice Claim accumulated rewards without unstaking
     */
    function claimRewards() external nonReentrant whenNotPaused {
        UserInfo storage userStake = userInfo[msg.sender];
        require(userStake.amount > 0, "No stake found");
        
        uint256 rewards = pending(msg.sender);
        require(rewards >= MIN_REWARD_THRESHOLD, "No rewards to claim");
        
        // Reset rewards and update deposit time
        userStake.pendingRewards = 0;
        userStake.depositTime = block.timestamp;
        totalRewardsDistributed += rewards;
        
        // Transfer rewards
        tipToken.safeTransfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards, block.timestamp);
    }

    /**
     * @notice Get user staking information
     * @param user Address of the user
     * @return amount Staked amount
     * @return rewards Pending rewards
     * @return depositTime Time of last deposit
     * @return unlockTime Time when stake can be withdrawn without penalty
     */
    function getUserInfo(address user) external view returns (
        uint256 amount,
        uint256 rewards,
        uint256 depositTime,
        uint256 unlockTime
    ) {
        UserInfo storage userStake = userInfo[user];
        amount = userStake.amount;
        rewards = pending(user);
        depositTime = userStake.depositTime;
        unlockTime = userStake.depositTime > 0 ? userStake.depositTime + MIN_LOCK_PERIOD : 0;
    }

    /**
     * @notice Get contract statistics
     * @return tvl Total value locked
     * @return apr Annual percentage rate
     * @return minLock Minimum lock period
     */
    function getStats() external view returns (
        uint256 tvl,
        uint256 apr,
        uint256 minLock
    ) {
        tvl = totalStaked;
        apr = REWARD_RATE;
        minLock = MIN_LOCK_PERIOD;
    }

    /**
     * @notice Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal function (only owner)
     * @param to Address to send the funds
     */
    function emergencyWithdraw(address to) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 balance = tipToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        
        tipToken.safeTransfer(to, balance);
        emit EmergencyWithdraw(to, balance, block.timestamp);
    }

    /**
     * @notice Check if user can unstake without penalty
     * @param user Address of the user
     * @return bool True if user can unstake without penalty
     */
    function canUnstakeWithoutPenalty(address user) external view returns (bool) {
        UserInfo storage userStake = userInfo[user];
        if (userStake.amount == 0) return false;
        return block.timestamp >= userStake.depositTime + MIN_LOCK_PERIOD;
    }

    /**
     * @notice Check if user can claim rewards
     * @param user Address of the user
     * @return bool True if user has enough rewards to claim
     */
    function canClaimRewards(address user) external view returns (bool) {
        return pending(user) >= MIN_REWARD_THRESHOLD;
    }

    /**
     * @notice Calculate penalty amount for early withdrawal
     * @param user Address of the user
     * @param amount Amount to unstake
     * @return penalty Penalty amount
     */
    function calculatePenalty(address user, uint256 amount) external view returns (uint256) {
        UserInfo storage userStake = userInfo[user];
        if (userStake.amount == 0 || amount == 0) return 0;
        if (block.timestamp >= userStake.depositTime + MIN_LOCK_PERIOD) return 0;
        return (amount * PENALTY_RATE) / 100;
    }
}