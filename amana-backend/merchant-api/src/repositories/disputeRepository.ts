/**
 * Amana Protocol - Dispute Repository
 */

import { getDb } from '../database/init';
import type { Dispute, DisputeTier, DisputeStatus } from '../shared-types';
import { v4 as uuid } from 'uuid';

export interface CreateDisputeInput {
  tradeId: string;
  filedBy: string;
  tier: DisputeTier;
  reason: string;
  evidence?: string;
}

export class DisputeRepository {
  findById(id: string): Dispute | undefined {
    const row = getDb().prepare('SELECT * FROM disputes WHERE id = ?').get(id) as any;
    return row ? this.mapRow(row) : undefined;
  }

  findByTrade(tradeId: string): Dispute[] {
    const rows = getDb().prepare('SELECT * FROM disputes WHERE trade_id = ? ORDER BY created_at DESC').all(tradeId) as any[];
    return rows.map(this.mapRow);
  }

  findAll(limit = 50, offset = 0): Dispute[] {
    const rows = getDb().prepare('SELECT * FROM disputes ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as any[];
    return rows.map(this.mapRow);
  }

  findByMerchant(merchantId: string): Dispute[] {
    const rows = getDb().prepare('SELECT * FROM disputes WHERE filed_by = ? ORDER BY created_at DESC').all(merchantId) as any[];
    return rows.map(this.mapRow);
  }

  create(input: CreateDisputeInput): Dispute {
    const id = uuid();
    getDb().prepare(`
      INSERT INTO disputes (id, trade_id, filed_by, tier, reason, evidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, input.tradeId, input.filedBy, input.tier, input.reason, input.evidence || null);
    return this.findById(id)!;
  }

  updateStatus(id: string, status: DisputeStatus, resolution?: string): Dispute | undefined {
    if (status === 'resolved') {
      getDb().prepare(`
        UPDATE disputes SET status = ?, resolution = ?, resolved_at = datetime('now') WHERE id = ?
      `).run(status, resolution || null, id);
    } else {
      getDb().prepare('UPDATE disputes SET status = ? WHERE id = ?').run(status, id);
    }
    return this.findById(id);
  }

  countOpen(): number {
    const row = getDb().prepare("SELECT COUNT(*) as count FROM disputes WHERE status != 'resolved'").get() as any;
    return row.count;
  }

  private mapRow(row: any): Dispute {
    return {
      id: row.id,
      tradeId: row.trade_id,
      filedBy: row.filed_by,
      tier: row.tier as DisputeTier,
      reason: row.reason,
      evidence: row.evidence || undefined,
      status: row.status as DisputeStatus,
      resolution: row.resolution || undefined,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at || undefined,
    };
  }
}

export const disputeRepo = new DisputeRepository();