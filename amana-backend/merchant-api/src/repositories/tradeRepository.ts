/**
 * Amana Protocol - Trade Repository
 */

import { getDb } from '../database/init';
import type { Trade, TradeStatus } from '../shared-types';
import { v4 as uuid } from 'uuid';

export interface CreateTradeInput {
  sellerId: string;
  buyerId: string;
  amount: string;
  currency: string;
  fiatEquivalent: number;
  fiatCurrency: string;
  description: string;
}

export class TradeRepository {
  findById(id: string): Trade | undefined {
    const row = getDb().prepare('SELECT * FROM trades WHERE id = ?').get(id) as any;
    return row ? this.mapRow(row) : undefined;
  }

  findByMerchant(merchantId: string, limit = 20, offset = 0): Trade[] {
    const rows = getDb().prepare(`
      SELECT * FROM trades 
      WHERE seller_id = ? OR buyer_id = ? 
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(merchantId, merchantId, limit, offset) as any[];
    return rows.map(this.mapRow);
  }

  findActiveByMerchant(merchantId: string): Trade[] {
    const rows = getDb().prepare(`
      SELECT * FROM trades 
      WHERE (seller_id = ? OR buyer_id = ?) 
        AND status NOT IN ('completed', 'cancelled', 'refunded', 'dispute_resolved')
      ORDER BY created_at DESC
    `).all(merchantId, merchantId) as any[];
    return rows.map(this.mapRow);
  }

  create(input: CreateTradeInput): Trade {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO trades (id, seller_id, buyer_id, amount, currency, fiat_equivalent, fiat_currency, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, input.sellerId, input.buyerId, input.amount, input.currency, 
           input.fiatEquivalent, input.fiatCurrency, input.description);
    return this.findById(id)!;
  }

  updateStatus(id: string, status: TradeStatus, extras?: Partial<{ escrowContractAddress: string; escrowId: string; completedAt: string }>): Trade | undefined {
    const sets = ['status = ?', 'updated_at = datetime(\'now\')'];
    const params: any[] = [status];

    if (extras?.escrowContractAddress) {
      sets.push('escrow_contract_address = ?');
      params.push(extras.escrowContractAddress);
    }
    if (extras?.escrowId) {
      sets.push('escrow_id = ?');
      params.push(extras.escrowId);
    }
    if (extras?.completedAt) {
      sets.push('completed_at = ?');
      params.push(extras.completedAt);
    }

    params.push(id);
    getDb().prepare(`UPDATE trades SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  findAll(limit = 50, offset = 0): Trade[] {
    const rows = getDb().prepare(`
      SELECT * FROM trades ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset) as any[];
    return rows.map(this.mapRow);
  }

  countByStatus(status: TradeStatus): number {
    const row = getDb().prepare('SELECT COUNT(*) as count FROM trades WHERE status = ?').get(status) as any;
    return row.count;
  }

  totalVolume(): number {
    const row = getDb().prepare('SELECT SUM(CAST(amount AS REAL)) as total FROM trades WHERE status = \'completed\'').get() as any;
    return row.total || 0;
  }

  private mapRow(row: any): Trade {
    return {
      id: row.id,
      sellerId: row.seller_id,
      buyerId: row.buyer_id,
      amount: row.amount,
      currency: row.currency,
      fiatEquivalent: row.fiat_equivalent,
      fiatCurrency: row.fiat_currency,
      description: row.description,
      status: row.status as TradeStatus,
      escrowContractAddress: row.escrow_contract_address,
      escrowId: row.escrow_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    };
  }
}

export const tradeRepo = new TradeRepository();