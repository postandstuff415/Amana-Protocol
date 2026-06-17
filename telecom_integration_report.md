# Amana Protocol: Telecom Integration Research Report

## 1. Executive Summary
This report outlines the technical and regulatory requirements for integrating USSD-based escrow services in the Amana Protocol's initial target markets: Kenya, Uganda, and Ghana. The protocol will leverage Africa's Talking (AT) as the primary aggregator while maintaining secondary direct links to major telcos (Safaricom, MTN) for redundancy and high-volume B2B reliability.

## 2. Africa's Talking (AT) API Availability
Africa's Talking provides a unified USSD gateway that abstracts the complexity of individual telco integrations.

| Feature | Details |
|---|---|
| **API Type** | HTTP/REST (JSON) |
| **Session Management** | Session-based (SessionID, PhoneNumber, Text, NetworkCode) |
| **Redundancy** | High (Multi-telco routing in each country) |
| **Integration Speed** | < 24 hours for shared shortcodes; 4-8 weeks for dedicated |

### 2.1 Shared vs. Dedicated Shortcodes
- **Shared Shortcodes (e.g., *483*XYZ#)**:
    - **Pros**: Zero setup time, low cost, immediate testing.
    - **Cons**: Sub-optimal for B2B trust, risk of prefix collisions, dependent on aggregator reputation.
- **Dedicated Shortcodes (e.g., *XYZ#)**:
    - **Pros**: High brand trust, easier for merchants to remember, dedicated throughput.
    - **Cons**: High setup cost, regulatory lead time (4-8 weeks), requires local business registration.

## 3. Country-Specific Analysis

### 3.1 Kenya
- **Regulator**: Communications Authority of Kenya (CA).
- **Major Telcos**: Safaricom (90%+ USSD traffic), Airtel, Telkom.
- **Requirements**:
    - Registered Kenyan entity.
    - Content Service Provider (CSP) License (Approx. KES 100,000 initial).
    - Dedicated Shortcode Application to CA.
- **Notes**: Safaricom is critical for the "Everyone Eats" model due to its massive merchant network and M-PESA dominance.

### 3.2 Uganda
- **Regulator**: Uganda Communications Commission (UCC).
- **Major Telcos**: MTN Uganda, Airtel Uganda.
- **Requirements**:
    - Value Added Services (VAS) License.
    - Application to UCC for shortcode allocation.
- **Notes**: MTN Uganda is the primary target for B2B wholesalers. UCC is very strict on USSD content and pricing transparency.

### 3.3 Ghana
- **Regulator**: National Communications Authority (NCA).
- **Major Telcos**: MTN Ghana, Telecel (Vodafone), AT (AirtelTigo).
- **Requirements**:
    - VAS License from NCA.
    - Local company registration.
- **Notes**: Ghana has a very competitive USSD landscape. MTN Ghana's USSD API is robust and widely used for fintech services.

## 4. Cost Estimates (Aggregator Level - AT)
*Note: These are estimates and subject to change.*

| Item | Kenya (KES) | Uganda (UGX) | Ghana (GHS) |
|---|---|---|---|
| **Dedicated Setup** | 150,000 | 5,000,000 | 8,000 |
| **Monthly Fee** | 20,000 | 1,000,000 | 1,500 |
| **Per Session** | 1.00 | 25.00 | 0.08 |

## 5. Implementation Recommendations
1. **Pilot Phase**: Start with a **Shared Shortcode** on Africa's Talking to validate the USSD menu flow and Merchant Onboarding with the first 500 traders.
2. **Growth Phase**: Apply for **Dedicated Shortcodes** in Kenya and Ghana immediately upon pilot launch to allow for the 8-week lead time.
3. **Redundancy**: Implement a fallback mechanism to a secondary aggregator (e.g., Move, Hover) to ensure 99.9% uptime for escrow releases.
4. **"Everyone Eats" Integration**: Programmatically deduct USSD session costs from the 40% Middle-End revenue split (Telecom Routing budget).

## 6. Regulatory Risks & Mitigation
- **Risk**: Delay in shortcode allocation.
  - **Mitigation**: Use shared shortcodes as a bridge while applications are pending.
- **Risk**: Sudden regulatory changes in VAS pricing.
  - **Mitigation**: Diversify across corridors; maintain 10% buffer in Middle-End treasury.
