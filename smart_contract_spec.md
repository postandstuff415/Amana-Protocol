# Amana Protocol: Smart Contract Interface Specification

## 1. IAmanaEscrow.sol
The core contract for handling stablecoin custody and trade lifecycle.

```solidity
interface IAmanaEscrow {
    enum TradeStatus { Open, Locked, Released, Disputed, Refunded }

    struct Trade {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        address token; // USDC or USDT
        TradeStatus status;
        uint256 createdAt;
        uint256 timeout;
    }

    event TradeCreated(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount);
    event TradeLocked(uint256 indexed tradeId);
    event TradeReleased(uint256 indexed tradeId);
    event TradeDisputed(uint256 indexed tradeId);

    function createTrade(address seller, uint256 amount, address token, uint256 timeout) external returns (uint256);
    function lockFunds(uint256 tradeId) external; // Called when buyer commits
    function releaseFunds(uint256 tradeId) external; // Called by buyer or oracle on delivery
    function initiateDispute(uint256 tradeId) external;
}
```

## 2. IEveryoneEats.sol (Revenue Split)
Handles the 35/40/25 programmatic distribution.

```solidity
interface IEveryoneEats {
    event RevenueDistributed(uint256 amount, uint256 frontEnd, uint256 middleEnd, uint256 backEnd);

    // Splits incoming protocol fees (1.0% spread)
    function distributeRevenue(uint256 amount, address token) external;

    // Withdraw functions for each pool
    function withdrawFrontEnd(address to, uint256 amount) external; // Merchant rebates
    function withdrawMiddleEnd(address to, uint256 amount) external; // Engineering/Telco
    function withdrawBackEnd(address to, uint256 amount) external; // Reserve/Founders
}
```

## 3. ITrustScore.sol
Manages merchant trust scores and transaction ceilings.

```solidity
interface ITrustScore {
    event ScoreUpdated(address indexed merchant, uint256 newScore, uint256 newCeiling);

    function getScore(address merchant) external view returns (uint256);
    function getCeiling(address merchant) external view returns (uint256);
    
    // Called by Escrow contract after successful trades
    function incrementScore(address merchant, uint256 tradeValue) external;
    function penalizeScore(address merchant) external;
}
```

## 4. IDisputeEngine.sol
Two-tier dispute resolution logic.

```solidity
interface IDisputeEngine {
    enum Tier { MicroShield, MacroIronCurtain }

    event DisputeResolved(uint256 indexed tradeId, address winner, Tier tier);

    // Resolves micro-disputes (<$100) automatically via Front-End pool
    function resolveMicroDispute(uint256 tradeId) external;

    // Requires Market Ambassador signatures for macro-disputes (>$100)
    function resolveMacroDispute(uint256 tradeId, address winner, bytes[] signatures) external;
}
```

## 5. Security & Account Abstraction Notes
- **Gas Sponsorship**: All contracts must be compatible with ERC-4337 EntryPoint for gasless user transactions.
- **Access Control**: Strict `onlyDisputeEngine` or `onlyEveryoneEats` modifiers on critical `IAmanaEscrow` state changes.
- **Oracle Integration**: `releaseFunds` should support a "Multi-Sig" trigger where (Buyer OR Merchant Ambassador) can release.
