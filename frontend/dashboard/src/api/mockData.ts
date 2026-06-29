/**
 * Amana Protocol - Admin Dashboard Mock Data
 *
 * Fallback data used when the Merchant API is unreachable.
 * Matches the same shape as the live API response for seamless switching.
 */

import type { Merchant, Trade, Dispute, YieldData } from './api'

export const MOCK_MERCHANTS: Merchant[] = [
  { id: 'mock-m-ke-001', phoneNumber: '+254712345678', country: 'KE', name: 'Grace Wanjiku', businessName: 'Wanjiku Supplies', status: 'active', walletAddress: '0x1a2b...3c4d', trustedContacts: [], totalTrades: 18, totalVolume: '12450000000000000000000', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-06-08T00:00:00.000Z' },
  { id: 'mock-m-ke-002', phoneNumber: '+254723456789', country: 'KE', name: 'James Ochieng', businessName: 'Ochieng Traders', status: 'active', walletAddress: '0x5e6f...7g8h', trustedContacts: [], totalTrades: 9, totalVolume: '6720000000000000000000', createdAt: '2026-04-15T00:00:00.000Z', updatedAt: '2026-06-07T00:00:00.000Z' },
  { id: 'mock-m-ug-001', phoneNumber: '+256701234567', country: 'UG', name: 'Sarah Nakato', businessName: 'Nakato Enterprises', status: 'active', walletAddress: '0x9i0j...1k2l', trustedContacts: [], totalTrades: 12, totalVolume: '8900000000000000000000', createdAt: '2026-04-10T00:00:00.000Z', updatedAt: '2026-06-06T00:00:00.000Z' },
  { id: 'mock-m-gh-001', phoneNumber: '+233501234567', country: 'GH', name: 'Kwame Asante', businessName: 'Asante Distributors', status: 'active', walletAddress: '0x3m4n...5o6p', trustedContacts: [], totalTrades: 5, totalVolume: '3400000000000000000000', createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-06-05T00:00:00.000Z' },
  { id: 'mock-m-ke-003', phoneNumber: '+254734567890', country: 'KE', name: 'Peter Kamau', businessName: 'Kamau Wholesale', status: 'active', walletAddress: '0x7q8r...9s0t', trustedContacts: [], totalTrades: 24, totalVolume: '18500000000000000000000', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-06-08T00:00:00.000Z' },
  { id: 'mock-m-ug-002', phoneNumber: '+256709876543', country: 'UG', name: 'Amina Ssali', businessName: 'Ssali Imports', status: 'active', walletAddress: '0x1u2v...3w4x', trustedContacts: [], totalTrades: 6, totalVolume: '4100000000000000000000', createdAt: '2026-05-10T00:00:00.000Z', updatedAt: '2026-06-04T00:00:00.000Z' },
]

export const MOCK_TRADES: Trade[] = [
  { id: 'mock-t-001', sellerId: 'mock-m-ug-001', buyerId: 'mock-m-ke-001', amount: '850000000000000000000', currency: 'USDC', fiatEquivalent: 110500, fiatCurrency: 'KES', description: 'Coffee beans shipment', status: 'buyer_funded', escrowContractAddress: '0x0000000000000000000000000000000000000001', escrowId: 'escrow-001', createdAt: '2026-06-01T08:00:00.000Z', updatedAt: '2026-06-01T10:00:00.000Z' },
  { id: 'mock-t-002', sellerId: 'mock-m-gh-001', buyerId: 'mock-m-ke-002', amount: '1200000000000000000000', currency: 'USDC', fiatEquivalent: 14400, fiatCurrency: 'GHS', description: 'Textile order', status: 'buyer_funded', escrowContractAddress: '0x0000000000000000000000000000000000000001', escrowId: 'escrow-002', createdAt: '2026-06-03T09:00:00.000Z', updatedAt: '2026-06-03T11:00:00.000Z' },
  { id: 'mock-t-003', sellerId: 'mock-m-ke-001', buyerId: 'mock-m-gh-001', amount: '350000000000000000000', currency: 'USDC', fiatEquivalent: 45500, fiatCurrency: 'KES', description: 'Tea export', status: 'completed', escrowContractAddress: '0x0000000000000000000000000000000000000001', escrowId: 'escrow-003', createdAt: '2026-06-04T07:00:00.000Z', updatedAt: '2026-06-06T15:00:00.000Z', completedAt: '2026-06-06T15:00:00.000Z' },
  { id: 'mock-t-004', sellerId: 'mock-m-ke-003', buyerId: 'mock-m-ug-002', amount: '2100000000000000000000', currency: 'USDC', fiatEquivalent: 273000, fiatCurrency: 'KES', description: 'Electronics bulk', status: 'dispute_opened', escrowContractAddress: '0x0000000000000000000000000000000000000001', escrowId: 'escrow-004', createdAt: '2026-06-05T10:00:00.000Z', updatedAt: '2026-06-07T12:00:00.000Z' },
  { id: 'mock-t-005', sellerId: 'mock-m-ug-001', buyerId: 'mock-m-ke-001', amount: '575000000000000000000', currency: 'USDC', fiatEquivalent: 2100000, fiatCurrency: 'UGX', description: 'Agricultural tools', status: 'completed', escrowContractAddress: '0x0000000000000000000000000000000000000001', escrowId: 'escrow-005', createdAt: '2026-06-06T11:00:00.000Z', updatedAt: '2026-06-08T09:00:00.000Z', completedAt: '2026-06-08T09:00:00.000Z' },
  { id: 'mock-t-006', sellerId: 'mock-m-gh-001', buyerId: 'mock-m-ke-002', amount: '1800000000000000000000', currency: 'USDC', fiatEquivalent: 21600, fiatCurrency: 'GHS', description: 'Clothing shipment', status: 'buyer_funded', escrowContractAddress: '0x0000000000000000000000000000000000000001', escrowId: 'escrow-006', createdAt: '2026-06-07T14:00:00.000Z', updatedAt: '2026-06-07T16:00:00.000Z' },
]

export const MOCK_DISPUTES: Dispute[] = [
  { id: 'mock-d-001', tradeId: 'mock-t-004', filedBy: 'mock-m-ug-002', tier: 'macro', reason: 'Goods not delivered — supplier unresponsive', status: 'under_review', createdAt: '2026-06-07T12:00:00.000Z' },
  { id: 'mock-d-002', tradeId: 'mock-t-006', filedBy: 'mock-m-ke-002', tier: 'micro', reason: 'Quantity mismatch — received 100 units instead of 150', status: 'open', createdAt: '2026-06-08T08:00:00.000Z' },
  { id: 'mock-d-003', tradeId: 'mock-t-002', filedBy: 'mock-m-ke-002', tier: 'macro', reason: 'Damaged goods in transit', status: 'resolved', resolution: 'Supplier refunded 50% — agreed by both parties', createdAt: '2026-06-05T09:00:00.000Z', resolvedAt: '2026-06-06T14:00:00.000Z' },
]

export interface MockDataSet {
  merchants: Merchant[]
  trades: Trade[]
  disputes: Dispute[]
  yieldData: YieldData
}

export const MOCK_ALL: MockDataSet = {
  merchants: MOCK_MERCHANTS,
  trades: MOCK_TRADES,
  disputes: MOCK_DISPUTES,
  yieldData: {
    totalYieldGenerated: '12450.50',
    merchantRebateShare: '4357.67',
    liquidityFloor: '25000',
    liquidEscrow: '15000',
    yieldBearingEscrow: '85000',
    lastUpdated: new Date().toISOString()
  }
}
