# Amana Protocol: Grant Application Package
*Zero-Trust B2B Trade Escrow for Emerging Markets*

## 1. Project Overview
Amana Protocol is a decentralized trade escrow platform designed for merchants in emerging markets who rely on legacy GSM feature phones. By bridging USSD technology with Ethereum Layer 2 (L2) stablecoin settlement (USDC/USDT), Amana eliminates counterparty risk, bypasses local dollar shortages, and reduces predatory cross-border wire fees from 6-10% to a transparent 1% FX spread.

## 2. Mission
To unlock regional trade in Africa and beyond by providing a trustless, mobile-first infrastructure that aligns the interests of merchants, developers, and local market infrastructure through the "Everyone Eats" revenue-sharing model.

## 3. The Problem
- **Trust Deficit**: Merchants in regional corridors (e.g., Kenya ↔ Uganda) lack a reliable escrow mechanism. Buyers fear non-delivery, and sellers fear non-payment.
- **Predatory Fees**: Regional bank wires are slow and extract 6-10% in fees and FX spreads.
- **FX Scarcity**: Chronic US Dollar shortages in local banks delay cross-border settlements for weeks.
- **Connectivity Gap**: Over 600 million people in Africa rely on feature phones with no internet access, excluding them from modern DeFi.

## 4. The Solution
- **USSD Interface**: A low-friction menu accessible on any GSM phone (Dial *483#).
- **ERC-4337 Wallets**: Smart contract wallets mapped deterministically to SIM cards, sponsoring gas for a seamless "web2-like" experience.
- **Two-Tier Dispute Engine**: 
    - **Micro-Shield**: Automated refunds for trades <$100 to build initial trust.
    - **Macro Iron Curtain**: Multi-sig resolution for high-value trades via Market Ambassadors.
- **Everyone Eats Model**: 100% of protocol revenue is split: 35% to merchant rebates, 40% to engineering/infra, 25% to reserves/royalty.

## 5. Target Ecosystem: Celo / Base
We are targeting **Celo** and **Base** due to:
- **Low Transaction Fees**: Essential for micro-trade sustainability.
- **Mobile-First Infrastructure**: Celo's Social Connect and MiniPay integrations align perfectly with our USSD-to-Wallet mapping.
- **Liquidity**: Deep stablecoin (USDC/USDT/cUSD) liquidity.

## 6. Budget Breakdown ($100,000 Target)
| Category | Allocation | Description |
|---|---|---|
| **Security Audits** | $30,000 | Professional audits for Escrow, Revenue Split, and Dispute contracts. |
| **Telecom Licensing** | $20,000 | Dedicated USSD shortcode procurement and VAS licensing in KE, UG, and GH. |
| **Pilot Liquidity** | $25,000 | Initial seed for the "Everyone Eats" rebate pool and gas sponsorship fund. |
| **Market Operations** | $25,000 | Onboarding 500 merchants via "Market Ambassadors" (physical vetting). |

## 7. Timeline & Milestones
- **Month 1: Foundation**: Secure licenses, complete smart contract audits, and finalize corridor partnerships.
- **Month 2: Alpha (KE/UG)**: Launch pilot with 50 pre-vetted merchants in the Kenya-Uganda corridor.
- **Month 3-6: Scaling**: Expand to 500 merchants; add Ghana corridor; reach $500k Monthly TPV.
- **Month 6+: DAO Transition**: Decentralize the Market Ambassador Chairman role and move toward DAO-led governance.

## 8. Impact Metrics
- **Total Peer-to-Peer Volume (TPV)**: Target $500,000/month by end of pilot.
- **Cost Savings**: Reduce merchant transaction costs by >80%.
- **Retention**: >85% month-over-month merchant retention rate.
- **Financial Inclusion**: Number of SIM-mapped wallets activated for non-smartphone users.

## 9. Technical Appendix (Current Progress)
- **USSD Gateway**: Node.js server with full menu state machine integrated with Africa's Talking API.
- **Relayer Service**: ERC-4337 middleware for phone-to-wallet mapping and gas sponsorship.
- **Smart Contracts**: 
    - `AmanaEscrow`: State machine for custody and release.
    - `EveryoneEats`: Programmatic revenue distribution logic.
    - `AmanaTrustScore`: On-chain reputation and velocity capping.
    - `AmanaDisputeEngine`: Two-tier dispute resolution logic.
