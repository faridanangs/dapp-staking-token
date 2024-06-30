// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// IMPORTING CONTRACT
import "./IERC20.sol";
import "./Initializable.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";

contract TokenStaking is Initializable, Ownable, ReentrancyGuard {
    //   struct to store the user's details
    struct User {
        uint256 stakeAmount; // Stake amount
        uint256 rewardAmount; // reward amount
        uint256 lastStakeTime; // Last Stake Timestamp
        uint256 lastRewardCalculationTime; // Last reward calculation time
        uint256 rewardClaimerSofar; // sum of the reward clamed so far
    }

    uint256 _minimumStakingAmount; // minimum staking amount

    uint256 _maxStakeTokenLimit; // maximum staking token limit

    uint256 _stakeStartDate; // staking start date

    uint256 _stakeEndDate; // staking end date

    uint256 _totalStakedTokens; // total staked tokens

    uint256 _totalusers; // total users

    uint256 _stakeDays; // staking days

    uint256 _earlyUnstakeFeePercentage; // early unstake fee percentage

    bool _isStakingPaused; // staking status

    // Token Contract Address
    address private _tokenAddress;

    // APY
    uint256 _apyRate;

    uint256 public constant PERCENTAGE_DENOMINATOR = 10000;
    uint256 public constant APY_RATE_CHANGE_THRESHOLD = 10;

    // User address => user
    mapping(address => User) private _users;

    // Event
    event Stake(address indexed user, uint256 amount);
    event UnStake(address indexed user, uint256 amount);
    event EarlyUnStakeFee(address indexed user, uint256 amount);
    event ClaimReward(address indexed user, uint256 amount);

    // Mpdifier
    modifier whenTreasuryHasBalance(uint256 amount) {
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= amount,
            "TokenStaking: Insufficient fund in the Treasury"
        );
        _;
    }

    function initialize(
        address owner_,
        address tokenAddress_,
        uint256 apyrate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnstakeFeePercentage_
    ) public virtual initializer {
        __TokenStaking_init_unchained(
            owner_,
            tokenAddress_,
            apyrate_,
            minimumStakingAmount_,
            maxStakeTokenLimit_,
            stakeStartDate_,
            stakeEndDate_,
            stakeDays_,
            earlyUnstakeFeePercentage_
        );
    }

    function __TokenStaking_init_unchained(
        address owner_,
        address tokenAddress_,
        uint256 apyrate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnstakeFeePercentage_
    ) internal onlyInitializing {
        require(
            _apyRate <= 10000,
            "TokenStaking: apy rate should be less than 10000"
        );
        require(stakeDays_ > 0, "TokenStaking: token days mus be non-zero");
        require(
            tokenAddress_ != address(0),
            "TokenStaking: token address cannot be 0 address"
        );
        require(
            stakeStartDate_ < stakeEndDate_,
            "TokenStaking: token start date must be less than stake end date"
        );

        _transferOwnership(owner_);
        _tokenAddress = tokenAddress_;
        _apyRate = apyrate_;
        _minimumStakingAmount = minimumStakingAmount_;
        _maxStakeTokenLimit = maxStakeTokenLimit_;
        _stakeStartDate = stakeStartDate_;
        _stakeEndDate = stakeEndDate_;
        _stakeDays = stakeDays_;
        _earlyUnstakeFeePercentage = earlyUnstakeFeePercentage_;
    }

    //
    // /// View method start
    //

    /**
     * @notice this function is used to get the minimum staking amount
     */
    function getMinimumStakingAmount() external view returns (uint256) {
        return _minimumStakingAmount;
    }

    /**
     * @notice this function is used to get the maximum staking amount
     */
    function getMaxStakingTokenLimit() external view returns (uint256) {
        return _maxStakeTokenLimit;
    }

    /**
     * @notice this function is used to get the staking start date
     */
    function getStakeStartDate() external view returns (uint256) {
        return _stakeStartDate;
    }

    /**
     * @notice this function is used to get the staking end date
     */
    function getStakeEndDate() external view returns (uint256) {
        return _stakeEndDate;
    }

    /**
     * @notice this function is used to get the total of tokens are staked
     */
    function getTotalStakedToken() external view returns (uint256) {
        return _totalStakedTokens;
    }

    /**
     * @notice this function is used to get the total of users
     */
    function getTotalUsers() external view returns (uint256) {
        return _totalusers;
    }

    /**
     * @notice this function is used to get the stake days
     */
    function getStakeDays() external view returns (uint256) {
        return _stakeDays;
    }

    /**
     * @notice this function is used to get early unstake fee percentage
     */
    function getEarlyUnstkeFeePercentage() external view returns (uint256) {
        return _earlyUnstakeFeePercentage;
    }

    /**
     * @notice this function is used to get staking status
     */
    function getStakingStatus() external view returns (bool) {
        return _isStakingPaused;
    }

    /**
     * @notice this function is used to get the current apy rate
     */
    function getApy() external view returns (uint256) {
        return _apyRate;
    }

    /**
     * @notice this function is used to get msg.sender estimated reward amount
     * @return msg.sender's estimated reward amount
     */
    function getUserEstimatedRewards() external view returns (uint256) {
        (uint256 amount, ) = _getUserEstimatedRewards(msg.sender);
        return _users[msg.sender].rewardAmount + amount;
    }

    /**
     * @notice this function is used to get withdrawable amount from contract
     */
    function getWithdrawableAmount() external view returns (uint256) {
        return
            IERC20(_tokenAddress).balanceOf(address(this)) - _totalStakedTokens;
    }

    /**
     * @notice this function is used to get user's details
     * @param userAddress User's address to get details of
     * @return User struct
     */
    function getUser(address userAddress) external view returns (User memory) {
        return _users[userAddress];
    }

    /**
     * @notice this function is used to check if a user is a stakeholder
     * @param _user address of the user to check
     * @return True is user is a stakeholder, false otherwise
     */
    function isStakeHolder(address _user) external view returns (bool) {
        return _users[_user].stakeAmount != 0;
    }

    //
    // /// View method end
    //

    //
    // /// Owner method start
    //

    /**
     * @notice this function is used to update minimum staking amount
     */
    function updateMinStakingAmount(uint256 newAmount) external onlyOwner {
        _minimumStakingAmount = newAmount;
    }

    /**
     * @notice this function is used to update maximum staking amount
     */
    function updateMaxStakingAmount(uint256 newAmount) external onlyOwner {
        _maxStakeTokenLimit = newAmount;
    }

    /**
     * @notice this function is used to update staking end date
     */
    function updateStakingEndDate(uint256 newdate) external onlyOwner {
        _stakeEndDate = newdate;
    }

    /**
     * @notice this function is used to update early unstake fee percentage
     */
    function updateEarlyUnstakePercentage(
        uint256 newPercentage
    ) external onlyOwner {
        _earlyUnstakeFeePercentage = newPercentage;
    }

    /**
     * @notice stake tokens for specific user
     * @dev This function can be used to stake tokens for specific user
     *
     * @param amount the amount to stake
     * @param user user's address
     */
    function stakeForUser(
        uint256 amount,
        address user
    ) external onlyOwner nonReentrant {
        _stakeTokens(amount, user);
    }

    /**
     * @notice enable/disable staking
     * @dev this function can be used to toggle staking status
     */
    function toggleStakingStatus() external onlyOwner {
        _isStakingPaused = !_isStakingPaused;
    }

    /**
     * @notice withdraw the specific amoint if possible
     * @dev This function can be used to withdraw the available tokens with this contract to teh caller
     *
     * @param amount the amount to stake
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(
            this.getWithdrawableAmount() >= amount,
            "Tokenstaking: not enought withdrawable tokens"
        );
        IERC20(_tokenAddress).transfer(msg.sender, amount);
    }

    //
    // /// Owner methods end
    //

    //
    // /// User methods start
    //

    /**
     * @notice this function is used to stake tokens
     * @param _amount Amount of tokens to be staked
     */
    function stake(uint256 _amount) external nonReentrant {
        _stakeTokens(_amount, msg.sender);
    }

    function _stakeTokens(uint256 _amount, address user_) private {
        require(!_isStakingPaused, "TokenStaking: staking is paused");

        uint256 currentTime = getCurrentTime();

        require(
            currentTime > _stakeStartDate,
            "TokenStaking: staking not started yet"
        );
        require(currentTime < _stakeEndDate, "TokenStaking: staking ended");
        require(
            _totalStakedTokens + _amount <= _maxStakeTokenLimit,
            "TokenStaking: max staking token limit reached"
        );
        require(_amount > 0, "TokenStaking: stake amount must be non-zero");
        require(
            _amount >= _minimumStakingAmount,
            "TokenStaking: stake amount must be greater than minimum amount allowed"
        );

        if (_users[user_].stakeAmount != 0) {
            _calculateRewards(user_);
        } else {
            _users[user_].lastRewardCalculationTime = currentTime;
            _totalusers += 1;
        }

        _users[user_].stakeAmount += _amount;
        _users[user_].lastStakeTime = currentTime;

        _totalStakedTokens += _amount;

        require(
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "TokenStaking: failed to transfer tokens"
        );

        emit Stake(user_, _amount);
    }

    /**
     * @notice This function is used to unstake tokens
     * @param _amount The amount of tokens to be unstaked
     */
    function unstake(
        uint256 _amount
    ) external nonReentrant whenTreasuryHasBalance(_amount) {
        address user = msg.sender;

        require(_amount != 0, "TokenStaking: amount should be non-zero");
        require(this.isStakeHolder(user), "TokenStaking: not a stakeholder");
        require(
            _users[user].stakeAmount >= _amount,
            "TokenStaking: not enough stake to unstake"
        );

        // Calculate user's reward until now
        _calculateRewards(user);

        uint256 feeEarlyUnstake;

        if (getCurrentTime() <= _users[user].lastStakeTime + _stakeDays) {
            feeEarlyUnstake = ((_amount * _earlyUnstakeFeePercentage) /
                PERCENTAGE_DENOMINATOR);

            emit EarlyUnStakeFee(user, _amount);
        }

        uint256 amountToUnstake = _amount - feeEarlyUnstake;

        _users[user].stakeAmount -= _amount;
        _totalStakedTokens -= _amount;

        if (_users[user].stakeAmount == 0) {
            // delete _users[user];
            _totalusers -= 1;
        }

        require(
            IERC20(_tokenAddress).transfer(msg.sender, amountToUnstake),
            "TokenStaking: falied transfer"
        );

        emit UnStake(user, _amount);
    }

    /**
     * @notice This function is used to claim user's reward
     */
    function claimReward()
        external
        nonReentrant
        whenTreasuryHasBalance(_users[msg.sender].rewardAmount)
    {
        _calculateRewards(msg.sender);

        uint256 rewardAmount = _users[msg.sender].rewardAmount;
        require(rewardAmount > 0, "TokenStaking: no reward to claim");

        require(
            IERC20(_tokenAddress).transfer(msg.sender, rewardAmount),
            "TokenStaking: failed to transfer"
        );

        _users[msg.sender].rewardAmount = 0;
        _users[msg.sender].rewardClaimerSofar += rewardAmount;

        emit ClaimReward(msg.sender, rewardAmount);
    }

    //
    // /// User methods end
    //

    //
    // /// Private helper methods start
    //

    /**
     * @notice This function is used to calculate reward for a user
     * @param _user address of the user
     */
    function _calculateRewards(address _user) private {
        (uint256 userReward, uint256 currentTime) = _getUserEstimatedRewards(
            _user
        );

        _users[_user].rewardAmount += userReward;
        _users[_user].lastRewardCalculationTime = currentTime;
    }

    /**
     * @notice this function is used to get estimated reward for a user
     * @param _user address of the user
     * @return estimated reward for user
     */
    function _getUserEstimatedRewards(
        address _user
    ) private view returns (uint256, uint256) {
        uint256 userReward;
        uint256 usertimeStamp = _users[_user].lastRewardCalculationTime;

        uint256 currentTime = getCurrentTime();

        if (currentTime > _users[_user].lastStakeTime + _stakeDays) {
            currentTime = _users[_user].lastStakeTime + _stakeDays;
        }

        uint256 totalStakedTime = currentTime - usertimeStamp;

        userReward =
            ((totalStakedTime * _users[_user].stakeAmount * _apyRate) / 365) /
            PERCENTAGE_DENOMINATOR;

        return (userReward, currentTime);
    }

    function getCurrentTime() internal view returns (uint256) {
        return block.timestamp;
    }
}
