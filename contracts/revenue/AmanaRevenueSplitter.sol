// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AmanaRevenueSplitter
 * @dev Implements the 35/40/25 revenue split for the Amana Protocol.
 * Uses SafeERC20 for non-compliant token safety (e.g. USDT).
 */
contract AmanaRevenueSplitter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public frontEndPool;   // 35%
    address public middleEndPool;  // 40%
    address public backEndPool;    // 25%

    uint256 public constant FRONT_END_SHARE = 3500;  // 35%
    uint256 public constant MIDDLE_END_SHARE = 4000; // 40%
    uint256 public constant BACK_END_SHARE = 2500;   // 25%
    uint256 public constant DENOMINATOR = 10000;

    event RevenueDistributed(address indexed token, uint256 amount);
    event PoolsUpdated(address frontEnd, address middleEnd, address backEnd);
    event GasBuybackTriggered(address indexed token, uint256 amount);

    constructor(
        address _frontEndPool,
        address _middleEndPool,
        address _backEndPool
    ) Ownable(msg.sender) {
        require(_frontEndPool != address(0), "Zero address: frontEndPool");
        require(_middleEndPool != address(0), "Zero address: middleEndPool");
        require(_backEndPool != address(0), "Zero address: backEndPool");
        frontEndPool = _frontEndPool;
        middleEndPool = _middleEndPool;
        backEndPool = _backEndPool;
    }

    function setPools(
        address _frontEndPool,
        address _middleEndPool,
        address _backEndPool
    ) external onlyOwner {
        require(_frontEndPool != address(0), "Zero address: frontEndPool");
        require(_middleEndPool != address(0), "Zero address: middleEndPool");
        require(_backEndPool != address(0), "Zero address: backEndPool");
        frontEndPool = _frontEndPool;
        middleEndPool = _middleEndPool;
        backEndPool = _backEndPool;
        emit PoolsUpdated(_frontEndPool, _middleEndPool, _backEndPool);
    }

    /**
     * @dev Distributes the token balance of this contract to the pools.
     * Follows Checks-Effects-Interactions pattern.
     */
    function distribute(address _token) external nonReentrant {
        require(_token != address(0), "Zero address: token");
        uint256 balance = IERC20(_token).balanceOf(address(this));
        require(balance > 0, "No balance to distribute");

        uint256 frontEndAmount = (balance * FRONT_END_SHARE) / DENOMINATOR;
        uint256 middleEndAmount = (balance * MIDDLE_END_SHARE) / DENOMINATOR;
        uint256 backEndAmount = balance - frontEndAmount - middleEndAmount; // Remaining goes to back-end to avoid dust

        // Interactions using SafeERC20
        IERC20(_token).safeTransfer(frontEndPool, frontEndAmount);
        IERC20(_token).safeTransfer(middleEndPool, middleEndAmount);
        IERC20(_token).safeTransfer(backEndPool, backEndAmount);

        emit RevenueDistributed(_token, balance);
    }

    /**
     * @dev Placeholder for gas buyback loop logic.
     * Swaps stablecoins from Front-End pool to native gas tokens.
     */
    function triggerGasBuyback(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(0), "Zero address: token");
        require(IERC20(_token).balanceOf(frontEndPool) >= _amount, "Insufficient pool balance");
        // In a real implementation, this would call a DEX aggregator (e.g. 1inch, Uniswap)
        // to swap USDC for ETH/CELO and send to a Paymaster wallet.
        emit GasBuybackTriggered(_token, _amount);
    }
}