# Simulation Audit Report: 500-Merchant Pilot

## 1. Executive Summary

### 1.1 Overview
This report provides a comprehensive analysis of the full-lifecycle simulation for the 500-merchant pilot batch, conducted within the "Beachhead Sandbox" environment. The primary objective was to validate the Amana Protocol's ability to handle high-concurrency USSD interactions, Merchant API request throughput, and smart contract settlement mechanics under realistic load conditions.

### 1.2 Simulation Goals
*   **Scalability:** Verify the system can support 500 concurrent merchants navigating USSD menus without significant latency degradation.
*   **Throughput:** Test the Merchant API's response times and error rates during peak transaction staging.
*   **Integrity:** Ensure ledger persistence and data consistency across the backend and on-chain state.
*   **Resilience:** Identify failure modes, service crashes, and database contention points before the actual pilot launch.

### 1.3 Key Findings
The simulation demonstrated exceptional robustness of the USSD-to-Web3 interface layer. With a 100% success rate on USSD interactions and 99.2% on API requests at an overall duration of 1,557ms (achieving a peak system throughput of 2,247.9 requests per second), the system is well-positioned for the 500-merchant pilot. The only failures observed were business logic rejections (inactive accounts), and the ledger successfully persisted 496 trades, confirming that the technical infrastructure and data integrity are stable.

---

## 2. Performance Analysis

### 2.1 Latency Distributions
| Interaction Type | Avg (ms) | P95 (ms) | Max (ms) |
| :--- | :--- | :--- | :--- |
| USSD Menu Navigation | 19.08 | 41 | 98 |
| API Request (Merchant) | 19.02 | 54 | 56 |

### 2.2 Request Throughput
*   **Total Overall Duration:** 1,557ms
*   **Peak System Throughput (RPS):** 2,247.9
*   **Total Interactions (USSD):** 3,000
*   **Total Transactions (API):** 500
*   **Ledger Persistence:** 496 trades
*   **Success Rate (USSD):** 100.0%
*   **Success Rate (API):** 99.2%

### 2.3 Error Rates
*   **API Rejections (Status 400):** 0.8% (4 total)
*   **Database Lock Errors:** 0.0%
*   **USSD Gateway Failures:** 0.0%

---

## 3. Identified Bottlenecks

### 3.1 Account Activation Edge Cases
The simulation identified a minor friction point where 0.8% of transactions failed due to "account not active" status. This suggests that while the system handles load well, the merchant state machine requires a more prominent "activation status" check in the USSD flow to prevent users from attempting trades before their wallets are fully initialized.

### 3.2 Database Scaling
Although no database lock errors were observed in this run, the peak system throughput of 2,247.9 RPS indicates that as the pilot scales beyond 500 merchants, the write frequency to the session table may necessitate a transition from SQLite to a dedicated edge-database solution.

---

## 4. Stability Assessment

### 4.1 Service Uptime
*   **Merchant API:** 100%
*   **Relayer Service:** 100%
*   **USSD Gateway:** 100%

### 4.2 Unexpected Behaviors
*   **Merchant Inactivity:** 4 requests failed business logic validation. No system crashes or service interruptions were recorded during the high-concurrency burst.

---

## 5. Strategic Recommendations

### 5.1 Short-Term (Pre-Pilot Launch)
*   **Horizontal Scaling:** Deploy multiple instances of the Merchant API and USSD Gateway behind a load balancer to distribute the callback load.
*   **Database Optimization:** Consider migrating from SQLite to a more robust distributed database (e.g., PostgreSQL or Turso with edge-caching) for the session management layer to handle high write concurrency.
*   **Queue Implementation:** Introduce a message queue (e.g., Redis or RabbitMQ) for transaction staging to decouple the USSD interface from the on-chain execution layer.

### 5.2 Long-Term (Phase 2 & Beyond)
*   **Edge Processing:** Explore deploying telephony handlers closer to the regional telecom hubs in Kenya and Uganda to reduce network hop latency.
*   **Trust Score Optimization:** Automate the Trust Score calculation as an off-chain oracle service to reduce on-chain state write frequency.
*   **Regional Resiliency:** Develop multi-region failover protocols to ensure continuity if a specific regional gateway faces infrastructure blockades.
