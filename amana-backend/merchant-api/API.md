# Amana Protocol — Merchant API Reference

## Base URL
`http://<host>:3001/api`

## Response Envelope
All endpoints return JSON in this format:
```json
{ "success": true/false, "data": {...}, "error": "...", "message": "..." }
```

## Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |

### Merchants
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/merchants/register` | Register new merchant (USSD onboarding). Body: `{ phoneNumber, country, name, businessName }` |
| POST | `/api/merchants/activate` | Activate after SIM verification. Body: `{ phoneNumber }` |
| GET | `/api/merchants` | List all merchants. Query: `?offset=0&limit=50` |
| GET | `/api/merchants/:id` | Get merchant by ID |
| GET | `/api/merchants/phone/:phoneNumber` | Get by phone number |
| POST | `/api/merchants/:id/wallet` | Link wallet address. Body: `{ walletAddress }` |
| POST | `/api/merchants/:id/suspend` | Suspend merchant |

### Trades
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/trades` | Create trade offer. Body: `{ sellerId, buyerId, amount, currency, fiatEquivalent, fiatCurrency, description }` |
| POST | `/api/trades/:id/fund` | Buyer funds escrow. Body: `{ escrowContractAddress, escrowId }` |
| POST | `/api/trades/:id/dispatch` | Seller marks in-transit |
| POST | `/api/trades/:id/confirm-delivery` | Buyer confirms delivery |
| POST | `/api/trades/:id/complete` | Complete (escrow released) |
| POST | `/api/trades/:id/cancel` | Cancel before funding |
| GET | `/api/trades/:id` | Get trade by ID |
| GET | `/api/trades/merchant/:merchantId` | Get all trades for merchant |
| GET | `/api/trades/merchant/:merchantId/active` | Get active trades only |

### Disputes (Two-Tier)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/disputes` | File dispute. Body: `{ tradeId, filedBy, tier?, reason, evidence? }` |
| POST | `/api/disputes/:id/resolve` | Admin resolve. Body: `{ resolution, resolveInFavorOfBuyer }` |
| GET | `/api/disputes/:id` | Get by ID |
| GET | `/api/disputes/trade/:tradeId` | Get for trade |
| GET | `/api/disputes/merchant/:merchantId` | Get for merchant |

## Trade Lifecycle
```
offer_created → buyer_funded → in_transit → delivery_confirmed → completed
                                                                    ↓ (dispute)
                                    dispute_opened → dispute_resolved → [refunded|completed]
```

## Two-Tier Dispute Engine
- **Micro claims** (< $50 equivalent): auto-resolved by system, buyer auto-refunded
- **Macro claims** (≥ $50): escalated to admin panel for manual review