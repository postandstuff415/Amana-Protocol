// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AmanaTrustScore
 * @dev Manages merchant trust scores and transaction ceilings.
 */
contract AmanaTrustScore is Ownable {
    struct Score {
        uint256 value;          // Trust score value
        uint256 tradeCount;     // Number of successful trades
        uint256 lastTradeAt;    // Timestamp of last trade
    }

    mapping(address => Score) public scores;
    
    // Ceilings in units of stablecoin (assuming 6 decimals like USDC)
    uint256 public baseCeiling = 100 * 1e6; // $100 starting ceiling
    uint256 public maxCeiling = 10000 * 1e6; // $10,000 max ceiling
    uint256 public incrementPerTrade = 50 * 1e6; // $50 increase per successful trade

    event ScoreUpdated(address indexed merchant, uint256 newValue, uint256 tradeCount);

    constructor() Ownable(msg.sender) {}

    function setCeilingParams(uint256 _base, uint256 _max, uint256 _increment) external onlyOwner {
        baseCeiling = _base;
        maxCeiling = _max;
        incrementPerTrade = _increment;
    }

    /**
     * @dev Check if a trade amount is within the merchant's current ceiling.
     */
    function isWithinCeiling(address _merchant, uint256 _amount) public view returns (bool) {
        uint256 currentCeiling = baseCeiling + (scores[_merchant].tradeCount * incrementPerTrade);
        if (currentCeiling > maxCeiling) {
            currentCeiling = maxCeiling;
        }
        return _amount <= currentCeiling;
    }

    /**
     * @dev Record a successful trade for a merchant.
     * Only callable by the Escrow contract.
     */
    function recordSuccessfulTrade(address _merchant) external {
        // In production, this would be restricted to authorized contracts (Escrow, DisputeEngine)
        scores[_merchant].tradeCount++;
        scores[_merchant].value += 10; // Increment score by 10 points
        scores[_merchant].lastTradeAt = block.timestamp;

        emit ScoreUpdated(_merchant, scores[_merchant].value, scores[_merchant].tradeCount);
    }
}
