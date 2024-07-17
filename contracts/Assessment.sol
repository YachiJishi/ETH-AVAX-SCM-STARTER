// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract UniqueContract {
    address payable public owner;
    uint256 public balance;
    bool public isFrozen;

    struct TicketHolder {
        address account;
        uint256 tickets;
    }

    TicketHolder[] public ticketHolders;
    mapping(address => uint256) public tickets;

    event TicketPurchased(address indexed buyer, uint256 tickets);
    event LotteryWon(address indexed winner, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event AccountFrozen(bool isFrozen);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
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

    function buyTickets(uint256 _tickets) public payable notFrozen {
        require(_tickets > 0, "Must buy at least one ticket");
        require(msg.value == _tickets * 0.01 ether, "Incorrect ether value sent");

        balance += msg.value;
        tickets[msg.sender] += _tickets;

        bool found = false;
        for (uint i = 0; i < ticketHolders.length; i++) {
            if (ticketHolders[i].account == msg.sender) {
                ticketHolders[i].tickets += _tickets;
                found = true;
                break;
            }
        }
        if (!found) {
            ticketHolders.push(TicketHolder(msg.sender, _tickets));
        }

        emit TicketPurchased(msg.sender, _tickets);
    }

    function drawWinner() public onlyOwner notFrozen {
        require(ticketHolders.length > 0, "No tickets sold");

        uint256 winnerIndex = random() % ticketHolders.length;
        address winner = ticketHolders[winnerIndex].account;
        uint256 prize = balance;

        balance = 0;
        payable(winner).transfer(prize);

        delete ticketHolders;
        for (uint i = 0; i < ticketHolders.length; i++) {
            delete tickets[ticketHolders[i].account];
        }

        emit LotteryWon(winner, prize);
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

    function random() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, ticketHolders.length)));
    }
}
