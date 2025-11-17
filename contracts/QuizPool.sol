// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title QuizPool
 * @notice A simple reward pool contract for Play-4-Celo quiz game
 * @dev This contract manages entry fees and payouts for quiz winners
 * 
 * Security Notes:
 * - Only admin can trigger payouts and emergency withdrawals
 * - All payouts are logged via events for transparency
 * - Uses pull-over-push pattern where possible
 * - Emergency withdraw is admin-only for fund recovery
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract QuizPool {
    // State variables
    address public admin;
    IERC20 public cUSD;
    uint256 public totalDeposits;
    uint256 public totalPayouts;

    // Events
    event Deposit(address indexed from, uint256 amount, uint256 timestamp);
    event Payout(address indexed admin, uint256 totalAmount, uint256 winnersCount, uint256 timestamp);
    event WinnerPaid(address indexed winner, uint256 amount, uint256 timestamp);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner, uint256 timestamp);
    event EmergencyWithdraw(address indexed admin, uint256 amount, uint256 timestamp);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "QuizPool: Only admin can call this function");
        _;
    }

    /**
     * @notice Constructor to initialize the QuizPool contract
     * @param _cUSDAddress Address of the cUSD token contract on Celo
     */
    constructor(address _cUSDAddress) {
        require(_cUSDAddress != address(0), "QuizPool: Invalid cUSD address");
        admin = msg.sender;
        cUSD = IERC20(_cUSDAddress);
        emit OwnerChanged(address(0), admin, block.timestamp);
    }

    /**
     * @notice Deposit entry fees into the pool
     * @dev Users should approve this contract before calling this function
     * @param amount Amount of cUSD to deposit
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "QuizPool: Amount must be greater than 0");
        require(cUSD.transferFrom(msg.sender, address(this), amount), "QuizPool: Transfer failed");
        
        totalDeposits += amount;
        emit Deposit(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Admin deposits funds directly (for off-chain collected fees)
     * @param amount Amount of cUSD to deposit
     */
    function adminDeposit(uint256 amount) external onlyAdmin {
        require(amount > 0, "QuizPool: Amount must be greater than 0");
        require(cUSD.transferFrom(msg.sender, address(this), amount), "QuizPool: Transfer failed");
        
        totalDeposits += amount;
        emit Deposit(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Pay out winners after a quiz round
     * @dev Only admin can call this. Arrays must have same length
     * @param winners Array of winner addresses
     * @param amounts Array of amounts corresponding to each winner
     */
    function payoutWinners(address[] calldata winners, uint256[] calldata amounts) external onlyAdmin {
        require(winners.length == amounts.length, "QuizPool: Arrays length mismatch");
        require(winners.length > 0, "QuizPool: No winners provided");

        uint256 totalPayout = 0;
        
        // Calculate total payout and validate
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "QuizPool: Invalid amount");
            totalPayout += amounts[i];
        }

        require(cUSD.balanceOf(address(this)) >= totalPayout, "QuizPool: Insufficient balance");

        // Execute payouts
        for (uint256 i = 0; i < winners.length; i++) {
            require(winners[i] != address(0), "QuizPool: Invalid winner address");
            require(cUSD.transfer(winners[i], amounts[i]), "QuizPool: Transfer failed");
            emit WinnerPaid(winners[i], amounts[i], block.timestamp);
        }

        totalPayouts += totalPayout;
        emit Payout(msg.sender, totalPayout, winners.length, block.timestamp);
    }

    /**
     * @notice Emergency withdraw all funds to admin
     * @dev Only use in case of critical issues or contract migration
     */
    function emergencyWithdraw() external onlyAdmin {
        uint256 balance = cUSD.balanceOf(address(this));
        require(balance > 0, "QuizPool: No balance to withdraw");
        require(cUSD.transfer(admin, balance), "QuizPool: Transfer failed");
        
        emit EmergencyWithdraw(admin, balance, block.timestamp);
    }

    /**
     * @notice Transfer admin rights to a new address
     * @param newAdmin Address of the new admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "QuizPool: Invalid new admin address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit OwnerChanged(oldAdmin, newAdmin, block.timestamp);
    }

    /**
     * @notice Get the current balance of the pool
     * @return Current cUSD balance of the contract
     */
    function getBalance() external view returns (uint256) {
        return cUSD.balanceOf(address(this));
    }

    /**
     * @notice Get pool statistics
     * @return balance Current pool balance
     * @return deposits Total deposits made
     * @return payouts Total payouts distributed
     */
    function getPoolStats() external view returns (uint256 balance, uint256 deposits, uint256 payouts) {
        return (cUSD.balanceOf(address(this)), totalDeposits, totalPayouts);
    }
}
