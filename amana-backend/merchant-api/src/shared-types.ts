/**
 * Amana Protocol - Shared Types & Constants
 * Backend/API Engineer
 * 
 * Core type definitions shared across merchant-api, ussd-gateway, and relayer-service.
 */

// ─── Merchant & Identity ───────────────────────────────────────────

export type MerchantStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface Merchant {
  id: string;                    // UUID
  phoneNumber: string;           // E.164 format, e.g. +254712345678
  country: string;               // ISO 3166-1 alpha-2: KE, UG, GH
  name: string;
  businessName: string;
  status: MerchantStatus;
  walletAddress: string;         // ERC-4337 account address (lowercase)
  trustedContacts: string[];     // Phone numbers of known counterparties
  totalTrades: number;
  totalVolume: string;           // Wei string
  createdAt: string;             // ISO 8601
  updatedAt: string;
}

// ─── Trade Lifecycle ───────────────────────────────────────────────

export type TradeStatus =
  | 'offer_created'      // Seller created offer, funds not yet escrowed
  | 'buyer_funded'       // Buyer deposited into escrow
  | 'in_transit'         // Seller confirmed dispatch
  | 'delivery_confirmed' // Buyer confirmed receipt
  | 'completed'          // Escrow released to seller (settled)
  | 'dispute_opened'     // Micro-claim or macro-escalation filed
  | 'dispute_resolved'   // Admin resolved dispute
  | 'cancelled'          // Cancelled before funding
  | 'refunded';          // Funds returned to buyer

export interface Trade {
  id: string;                    // UUID
  sellerId: string;              // Merchant ID
  buyerId: string;               // Merchant ID
  amount: string;                // Stablecoin amount (wei)
  currency: string;              // e.g. 'USDC', 'cUSD'
  fiatEquivalent: number;        // Local currency amount
  fiatCurrency: string;          // e.g. 'KES', 'UGX', 'GHS'
  description: string;
  status: TradeStatus;
  escrowContractAddress: string; // Escrow contract on-chain
  escrowId: string;              // ID within escrow contract
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ─── Dispute System (Two-Tier) ─────────────────────────────────────

export type DisputeTier = 'micro' | 'macro';
export type DisputeStatus = 'open' | 'under_review' | 'resolved';

export interface Dispute {
  id: string;
  tradeId: string;
  filedBy: string;               // Merchant ID of filer
  tier: DisputeTier;
  reason: string;
  evidence?: string;              // URL / reference
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── USSD Session ──────────────────────────────────────────────────

export type USSDMenuScreen =
  | 'welcome'
  | 'register_name'
  | 'register_business'
  | 'register_pin'
  | 'main_menu'
  | 'new_trade_seller'
  | 'new_trade_amount'
  | 'new_trade_currency'
  | 'new_trade_buyer'
  | 'new_trade_confirm'
  | 'my_trades'
  | 'trade_detail'
  | 'confirm_delivery'
  | 'dispute_reason'
  | 'dispute_tier'
  | 'balance'
  | 'profile'
  | 'error'
  | 'exit';

export interface USSDState {
  sessionId: string;             // Africa's Talking session ID
  phoneNumber: string;
  merchantId?: string;
  currentScreen: USSDMenuScreen;
  menuStack: USSDMenuScreen[];   // For back-navigation
  data: Record<string, any>;     // Transient session data
  createdAt: number;             // Unix ms
  updatedAt: number;
}

// ─── Wallet / Relayer ──────────────────────────────────────────────

export interface WalletRegistration {
  phoneNumber: string;
  merchantId: string;
  walletAddress: string;         // ERC-4337 counterfactual address
  isDeployed: boolean;           // Whether counterfactual is deployed
  createdAt: string;
}

// ─── API Response Envelope ─────────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Constants ─────────────────────────────────────────────────────

export const COUNTRY_CODES: Record<string, { prefix: string; name: string; currency: string }> = {
  KE: { prefix: '+254', name: 'Kenya', currency: 'KES' },
  UG: { prefix: '+256', name: 'Uganda', currency: 'UGX' },
  GH: { prefix: '+233', name: 'Ghana', currency: 'GHS' },
};

export const STABLECOINS = ['USDC', 'cUSD', 'USDT'] as const;

export const USSD_SHORTCODE = '*483#';

export const USSD_SESSION_TIMEOUT_MS = 120_000; // 2 minutes

export const DISPUTE_TIERS = {
  MICRO: { label: 'Micro Claim', maxAmount: '50', description: 'Auto-resolved < $50' },
  MACRO: { label: 'Macro Escalation', maxAmount: 'unlimited', description: 'Admin-mediated dispute' },
} as const;