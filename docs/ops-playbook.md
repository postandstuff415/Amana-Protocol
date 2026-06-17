# Amana Protocol: Pilot Operations Playbook
*The Definitive Guide for the 500-Merchant Pilot Launch*

## 1. Merchant Onboarding & Vetting
To maintain the integrity of the escrow pool, every merchant must pass a multi-step vetting process.

### 1.1 Vetting Checklist
- [ ] **Verified B2B Trader**: Physical site visit or trade license verification.
- [ ] **Existing Trade Volume**: Minimum $1,000 monthly turnover in regional trade.
- [ ] **References**: At least two references from the local Market Traders Association.
- [ ] **SIM Ownership**: Must match the National ID used for mobile money (vetted via Africa's Talking SIM Lookup API).

### 1.2 USSD SIM Verification Flow
1. **Dial**: Merchant dials the Amana Shortcode (e.g., `*483*123#`).
2. **Lookup**: Backend triggers `AT.simLookup(msisdn)` to verify SIM registration status and age.
3. **KYC**: Merchant prompted to enter National ID Number.
4. **Mapping**: Deterministic ERC-4337 wallet address generated from hashed MSISDN.
5. **Confirmation**: Merchant receives SMS: "Welcome to Amana. Your trustless wallet [address] is now active."

## 2. First Trade Walkthrough
The USSD menu is designed for zero-latency interaction on 2G networks.

### Screen 1: Main Menu
```text
Welcome to Amana
1. New Trade
2. My Trades
3. Balance
4. Profile
5. Dispute
```

### Screen 2: Initiation
Merchant selects `1. New Trade`.
```text
Enter Seller Phone:
[0712345678]
```

### Screen 3: Amount
```text
Enter Amount (KES):
[5000]
```

### Screen 4: Description
```text
Item Description:
[5 Sacks of Maize]
```

### Screen 5: Confirmation
```text
Confirm Trade?
KES 5,000 for 5 Sacks of Maize.
1. Yes
2. No
```

## 3. Dispute Resolution
Disputes are handled via a two-tier system to balance automation with physical verification.

### Tier 1: Micro-Shield (<$100)
- **Automatic**: Refunded from the Front-End Pool if delivery is not confirmed within 72 hours and buyer files a dispute.
- **Limit**: Once per 90 days per SIM to prevent systemic fraud.
- **Timeline**: Immediate resolution.

### Tier 2: Macro Iron Curtain (>$100)
- **Lock**: Funds frozen in the Escrow contract.
- **Ambassador Role**: A Market Ambassador is dispatched to verify delivery notes/goods.
- **Chairman Signature**: Resolution requires a multi-sig signature from the Market Ambassador Chairman.
- **Timeline**: 24-48 hour resolution.

## 4. Escalation Matrix

| Issue Type | Primary Handler | Secondary Handler |
|---|---|---|
| **USSD Connection Error** | Backend Engineering | Telco Ops (Africa's Talking) |
| **Escrow Contract Bug** | Smart Contract Lead | Lead Auditor |
| **Merchant Identity Fraud** | Market Ambassador | Legal/Police |
| **Liquidity/Pool Drain** | Back-End Treasury | Sovereign Float Reserve |

**Artifact**: `/home/team/shared/docs/ops-playbook.md`
