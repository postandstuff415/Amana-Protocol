# Amana Protocol: Pilot Operations Playbook
*A Guide for the 500-Merchant Pilot Launch (Kenya, Uganda, Ghana)*

## 1. Introduction
This playbook defines the operational workflows for the Amana Protocol pilot. The goal is to onboard 500 B2B merchants across three corridors to validate the USSD escrow model and the "Everyone Eats" revenue distribution.

## 2. Merchant Vetting & Onboarding
To maintain trust, all pilot merchants must be pre-vetted.

### 2.1 Vetting Criteria
- **Proven Trade History**: At least 12 months of active B2B operations.
- **SIM Ownership**: Must have a registered SIM card in their own name (verified via telco KYC).
- **Referral**: Must be referred by a recognized Market Ambassador or existing trusted wholesaler.

### 2.2 SIM Verification Flow (USSD)
1. Merchant dials `*483*XYZ#`.
2. System captures `MSISDN` (Phone Number).
3. System checks MSISDN against pre-vetted list.
4. Merchant enters National ID to confirm identity.
5. Smart contract wallet (ERC-4337) is automatically provisioned and mapped to the MSISDN.

## 3. First Trade Walkthrough
A typical "Trust-Building" trade in the pilot.

1. **Initiation**: Buyer (Retailer) dials USSD and selects "New Trade".
2. **Details**: Buyer enters Seller's phone number and the Amount (in local currency, e.g., KES).
3. **Escrow Lock**: Buyer confirms; funds are converted to stablecoin and locked in the `AmanaEscrow` contract.
4. **Seller Notification**: Seller receives an SMS: *"Amana: [Buyer Name] has locked [Amount] for your trade. Deliver goods to release."*
5. **Delivery**: Seller delivers goods.
6. **Release**: Buyer dials USSD and selects "Confirm Delivery". Funds are instantly released to the Seller's Amana wallet.

## 4. Dispute Resolution Procedures
Disputes are handled via the `DisputeEngine`.

### 4.1 Tier 1: Micro-Shield (<$100)
- **Auto-Refund**: If a buyer claims non-delivery for a small amount, the system auto-refunds from the Front-End pool.
- **Limit**: Capped at once per 90 days per SIM to prevent abuse.

### 4.2 Tier 2: Macro Iron Curtain (>$100)
1. **Lock**: Funds are frozen in escrow.
2. **Investigation**: A Market Ambassador is assigned to verify the dispute (e.g., check delivery notes, physical goods).
3. **Resolution**: Ambassador Chairman provides a digital signature via the `IDisputeEngine` to release funds to the rightful party.

## 5. Escalation Paths
- **Technical Issue**: USSD Gateway Log -> Engineering (Middle-End budget).
- **Fraud Suspicion**: SIM Blacklist -> Trust Score reset to zero -> Legal escalation if necessary.
- **Liquidity Issue**: Float Reserve Drawdown -> Back-End protocol intervention.

## 6. Pilot KPIs for Review
- **Conversion Rate**: Vetted Leads -> First Successful Trade.
- **System Uptime**: USSD Session success rate.
- **Revenue Accuracy**: Verification of 35/40/25 split on-chain.
- **Merchant Retention**: % of merchants performing >3 trades per month.
