# Amana Protocol: Dynamic Capital-Yield Infrastructure

## 1. Overview

The **Dynamic Capital-Yield Infrastructure** is a major architectural upgrade for the Amana Protocol, transitioning from a "Static Escrow" model to a high-velocity "Dynamic Escrow" model. This infrastructure ensures that idle capital within the escrow contracts is not merely sitting stagnant but is actively generating yield to fuel the "Everyone Eats" programmatic rebate loop, while simultaneously maintaining a robust, predictive liquidity buffer for operational stability.

## 2. Static vs. Dynamic Escrow Models

### 2.1 Static Escrow (Legacy)
In the traditional static model, funds (USDC/USDT) transferred into the `AmanaEscrow` contract remained idle for the duration of the trade lifecycle (creation to delivery/dispute resolution). This resulted in significant "opportunity cost" for the protocol and its stakeholders.

### 2.2 Dynamic Escrow (Current)
The Dynamic Escrow model treats the protocol's total value locked (TVL) as a productive asset. By integrating with leading DeFi yield protocols, Amana programmatically routes "excess" capital—defined as funds above a calculated liquidity floor—into yield-bearing positions. This maximizes the protocol's financial velocity without compromising its primary function as a secure trade settlement layer.

## 3. Yield-Bearing Protocol Integration

The protocol utilizes standardized interfaces to interact with external DeFi ecosystems:

*   **ERC-4626 (Tokenized Vaults):** Standardized routing to yield vaults.
*   **Aave Lending Pools:** Direct integration with Aave's liquidity markets for immediate stablecoin yield.
*   **_evaluateAndRouteYield()**: A post-check hook executed during trade initialization (`initializeTrade`) that determines if the new influx of capital pushes the contract balance above the current **Predictive Liquidity Floor**.
*   **_recallYieldCapital()**: Internal logic that automatically triggers a withdrawal from yield positions if the contract's liquid balance falls below the amount required to process a `releaseEscrow` or `refundEscrow` call.

## 4. Predictive Liquidity Floor (Φ(t))

To ensure that trade settlements are never delayed by yield-routing, the protocol implements a **Predictive Liquidity Floor**, denoted as **Φ(t)**.

### 4.1 The Calculation Microservice
A dedicated Python-based **Analytics Predictor** microservice calculates Φ(t) using:
*   **Algorithm:** Time-series analysis (Exponential Moving Average / EMA).
*   **Inputs:** Real-time trade initialization logs and transactional velocities from USSD gateways and Merchant APIs.
*   **Window:** Predicts required liquidity for the next **72 hours**.
*   **Safety Variance:** A mandatory **15% safety buffer** is added to the prediction to account for unexpected volatility.

### 4.2 On-Chain Oracle Updates
The microservice functions as a restricted oracle, calling `updateLiquidityFloor` on-chain every 60 minutes. This dynamic adjustment allows the protocol to contract or expand its yield-allocated capital based on actual market activity.

## 5. Multi-Hop Algorithmic Swap Optimization

The **Multi-Hop Relayer Upgrade** optimizes the conversion of assets across cross-border corridors (e.g., Kenya ↔ Uganda).

*   **DEX Aggregator Integration:** Utilizing SDKs from 1inch or Uniswap Router APIs to find the most efficient path for asset swaps.
*   **Algorithmic Routing:** The relayer intercepts cross-border tasks and executes multi-hop queries to minimize FX spreads and slippage.
*   **Path Native Settlement:** Payments are routed natively across active liquidity corridors, ensuring that merchants receive the maximum value in their local stablecoin equivalent.

## 6. Implementation Guardrails & Security

*   **Liquidity Priority:** The protocol is hardcoded to prioritize trade liquidity over yield generation. If a withdrawal from a yield position fails, the protocol reverts to a safe state.
*   **Gas Preservation (Min Variance Check):** To prevent excessive gas consumption from frequent micro-sweeps, yield routing only triggers if the variance from the current floor exceeds a predefined threshold.
*   **Restricted Access:** Only the verified `liquidityPredictorOracle` (managed by the Amana backend) can update the Φ(t) floor, preventing external manipulation of the protocol's liquidity state.
