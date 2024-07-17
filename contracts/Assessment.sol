// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public totalStaked;
    bool public isFrozen;

    struct Stake {
        uint256 amount;
        uint256 lastStakeTime;
    }

    mapping(address => Stake) public stakes;
    address[] public stakers; // Maintain a list of stakers

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event AccountFrozen(bool isFrozen);
    event RewardDistributed(address indexed user, uint256 reward);

    constructor() {
        owner = payable(msg.sender); // Use payable here to initialize owner
        totalStaked = 0;
        isFrozen = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this contract");
        _;
    }

    modifier notFrozen() {
        require(!isFrozen, "The account is currently frozen");
        _;
    }

    receive() external payable {
        revert("Contract does not accept direct payments");
    }

    function stake() public payable notFrozen {
        require(msg.value > 0, "Stake amount must be greater than zero");
        
        stakes[msg.sender].amount += msg.value;
        stakes[msg.sender].lastStakeTime = block.timestamp;
        totalStaked += msg.value;

        // Add the user to the list of stakers if not already added
        if (stakes[msg.sender].amount == msg.value) {
            stakers.push(msg.sender);
        }

        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 _amount) public notFrozen {
        require(stakes[msg.sender].amount >= _amount, "Insufficient staked balance");

        stakes[msg.sender].amount -= _amount;
        totalStaked -= _amount;
        payable(msg.sender).transfer(_amount);

        // Remove the user from the list of stakers if their stake becomes zero
        if (stakes[msg.sender].amount == 0) {
            for (uint i = 0; i < stakers.length; i++) {
                if (stakers[i] == msg.sender) {
                    stakers[i] = stakers[stakers.length - 1];
                    stakers.pop();
                    break;
                }
            }
        }

        emit Unstaked(msg.sender, _amount);
    }

    function distributeRewards() public onlyOwner notFrozen {
        uint256 rewardPool = address(this).balance - totalStaked;
        require(rewardPool > 0, "No rewards to distribute");

        for (uint i = 0; i < stakers.length; i++) {
            address user = stakers[i];
            uint256 userStake = stakes[user].amount;
            if (userStake > 0) {
                uint256 reward = (userStake * rewardPool) / totalStaked;
                payable(user).transfer(reward);
                emit RewardDistributed(user, reward);
            }
        }
    }

    function getStakeAmount(address user) public view returns (uint256) {
        return stakes[user].amount;
    }

    function transferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");

        address payable previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function freezeAccount(bool freeze) public onlyOwner {
        isFrozen = freeze;
        emit AccountFrozen(isFrozen);
    }

    function unfreezeAccount() public onlyOwner {
        isFrozen = false;
        emit AccountFrozen(isFrozen);
    }
}
