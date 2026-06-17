# Amana Protocol: Telecom Integration Research Report
*Deep Dive into USSD Infrastructure and Regulatory Landscapes*

## 1. Regulatory Requirements by Country

| Country | Regulator | Timeline | Setup Cost (Est) | Key Requirements |
|---|---|---|---|---|
| **Kenya** | CA | 4-6 Weeks | $1,200 | CSP License, Local Entity, Data Privacy Compliance |
| **Uganda** | UCC | 6-8 Weeks | $1,500 | VAS License, Financial Audit History, Local Rep |
| **Ghana** | NCA | 4-8 Weeks | $800 | VAS Class License, Business Registration |

## 2. Africa's Talking (AT) USSD API Reference
Amana Protocol utilizes AT as its primary gateway for multi-country routing.

- **Rate Limits**: 100 concurrent sessions (scalable upon request).
- **Session Timeout**: Default 30 seconds; configurable up to 60 seconds via AT dashboard.
- **Callback URL**: `https://api.amanaprotocol.io/ussd` (must return CON/END prefixed text).
- **Supported Countries**: Kenya, Uganda, Ghana, Nigeria, Tanzania, South Africa.

## 3. Telco Specifics & Integration Potential

### 3.1 Safaricom (Kenya)
- **M-Pesa Integration**: High priority. Potential to trigger C2B M-Pesa push notifications directly from the USSD trade flow to fund the escrow wallet.
- **Reliability**: Highest in the region (99.9% USSD uptime).

### 3.2 MTN Uganda & Ghana
- **MoMo API**: MTN's Mobile Money API is robust. Amana can utilize MTN MoMo as an off-ramp for merchants preferring local currency over stablecoins.
- **USSD Quality**: Dedicated shortcodes on MTN are essential for consistent low-latency response times during peak market hours.

## 4. Regulatory Considerations & Risks
- **Data Privacy**: All merchant phone numbers and transaction logs must be stored in compliance with the Kenya Data Protection Act and similar regional laws.
- **Mobile Money Licensing**: Amana operates as a software provider mapping USSD to on-chain actions. We must ensure we are not classified as a "Payment Service Provider" (PSP) by ensuring funds never touch our own bank accounts (always locked in smart contracts).
- **KYC**: SIM registration at the telco level provides a baseline KYC, but Amana must maintain its own vetted list of National ID mappings to prevent SIM-swap fraud.

## 5. Recommended Phase 1 Shortcode Strategy
1. **Aggregator Shared Code**: Use AT shared codes (*483#) for the first 30 days of the pilot to gather UX data.
2. **Parallel Application**: Start the CA (Kenya) and UCC (Uganda) dedicated shortcode applications on Day 1 of the pilot.
3. **Redundancy**: Establish a secondary link via **Hover** or **Move** in Month 3 to mitigate the risk of single-aggregator downtime.

**Artifact**: `/home/team/shared/docs/telecom-research.md`
