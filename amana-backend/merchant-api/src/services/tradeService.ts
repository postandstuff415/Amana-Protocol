/**
 * Amana Protocol - Trade Service
 * 
 * Manages the trade lifecycle from offer creation through settlement.
 * Each state transition triggers appropriate escrow actions via the relayer.
 */

import { tradeRepo, type CreateTradeInput } from '../repositories/tradeRepository';
import { merchantRepo } from '../repositories/merchantRepository';
import type { Trade, TradeStatus, ApiResponse } from '../shared-types';

export class TradeService {
  /**
   * Create a new trade offer (seller initiates).
   * Status: offer_created
   */
  create(input: CreateTradeInput): ApiResponse<Trade> {
    // Validate both merchants exist and are active
    const seller = merchantRepo.findById(input.sellerId);
    if (!seller) return { success: false, error: 'Seller not found' };
    if (seller.status !== 'active') return { success: false, error: 'Seller account is not active' };

    const buyer = merchantRepo.findById(input.buyerId);
    if (!buyer) return { success: false, error: 'Buyer not found' };
    if (buyer.status !== 'active') return { success: false, error: 'Buyer account is not active' };

    const trade = tradeRepo.create(input);
    return { success: true, data: trade, message: 'Trade offer created' };
  }

  /**
   * Buyer deposits funds into escrow.
   * Status: offer_created → buyer_funded
   */
  fund(tradeId: string, escrowContractAddress: string, escrowId: string): ApiResponse<Trade> {
    const trade = tradeRepo.findById(tradeId);
    if (!trade) return { success: false, error: 'Trade not found' };
    if (trade.status !== 'offer_created') {
      return { success: false, error: `Cannot fund trade in status: ${trade.status}` };
    }

    const updated = tradeRepo.updateStatus(tradeId, 'buyer_funded', {
      escrowContractAddress,
      escrowId,
    });
    return { success: true, data: updated, message: 'Escrow funded — seller may dispatch' };
  }

  /**
   * Seller marks goods as dispatched.
   * Status: buyer_funded → in_transit
   */
  markInTransit(tradeId: string): ApiResponse<Trade> {
    const trade = tradeRepo.findById(tradeId);
    if (!trade) return { success: false, error: 'Trade not found' };
    if (trade.status !== 'buyer_funded') {
      return { success: false, error: `Cannot dispatch in status: ${trade.status}` };
    }

    const updated = tradeRepo.updateStatus(tradeId, 'in_transit');
    return { success: true, data: updated, message: 'Marked as in transit' };
  }

  /**
   * Buyer confirms delivery.
   * Status: in_transit → delivery_confirmed
   */
  confirmDelivery(tradeId: string): ApiResponse<Trade> {
    const trade = tradeRepo.findById(tradeId);
    if (!trade) return { success: false, error: 'Trade not found' };
    if (trade.status !== 'in_transit') {
      return { success: false, error: `Cannot confirm delivery in status: ${trade.status}` };
    }

    const updated = tradeRepo.updateStatus(tradeId, 'delivery_confirmed');
    return { success: true, data: updated, message: 'Delivery confirmed — funds being released' };
  }

  /**
   * Complete the trade (escrow released to seller).
   * Status: delivery_confirmed → completed
   * Called by the relayer after on-chain settlement.
   */
  complete(tradeId: string): ApiResponse<Trade> {
    const trade = tradeRepo.findById(tradeId);
    if (!trade) return { success: false, error: 'Trade not found' };
    if (trade.status !== 'delivery_confirmed') {
      return { success: false, error: `Cannot complete in status: ${trade.status}` };
    }

    const updated = tradeRepo.updateStatus(tradeId, 'completed', {
      completedAt: new Date().toISOString(),
    });

    // Increment merchant counters
    merchantRepo.incrementTradeCounter(trade.sellerId, trade.amount);

    return { success: true, data: updated, message: 'Trade completed successfully' };
  }

  /**
   * Cancel a trade before funding.
   * Status: offer_created → cancelled
   */
  cancel(tradeId: string): ApiResponse<Trade> {
    const trade = tradeRepo.findById(tradeId);
    if (!trade) return { success: false, error: 'Trade not found' };
    if (trade.status !== 'offer_created') {
      return { success: false, error: 'Can only cancel trades in offer_created status' };
    }

    const updated = tradeRepo.updateStatus(tradeId, 'cancelled');
    return { success: true, data: updated, message: 'Trade cancelled' };
  }

  /**
   * Get trade details by ID.
   */
  list(offset = 0, limit = 50): ApiResponse<Trade[]> {
    const trades = tradeRepo.findAll(limit, offset);
    return { success: true, data: trades };
  }

  getById(tradeId: string): ApiResponse<Trade> {
    const trade = tradeRepo.findById(tradeId);
    if (!trade) return { success: false, error: 'Trade not found' };
    return { success: true, data: trade };
  }

  /**
   * Get all trades for a merchant (as seller or buyer).
   */
  getByMerchant(merchantId: string): ApiResponse<Trade[]> {
    const trades = tradeRepo.findByMerchant(merchantId);
    return { success: true, data: trades };
  }

  /**
   * Get active (pending) trades for a merchant.
   */
  getActiveByMerchant(merchantId: string): ApiResponse<Trade[]> {
    const trades = tradeRepo.findActiveByMerchant(merchantId);
    return { success: true, data: trades };
  }
}

export const tradeService = new TradeService();