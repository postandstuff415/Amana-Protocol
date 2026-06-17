/**
 * Amana Protocol - Merchant Repository
 */

import { getDb } from '../database/init';
import type { Merchant, MerchantStatus } from '../shared-types';
import { v4 as uuid } from 'uuid';

export interface CreateMerchantInput {
  phoneNumber: string;
  country: string;
  name: string;
  businessName: string;
}

export class MerchantRepository {
  findByPhone(phone: string): Merchant | undefined {
    const row = getDb().prepare(
      'SELECT * FROM merchants WHERE phone_number = ?'
    ).get(phone) as any;
    return row ? this.mapRow(row) : undefined;
  }

  findById(id: string): Merchant | undefined {
    const row = getDb().prepare(
      'SELECT * FROM merchants WHERE id = ?'
    ).get(id) as any;
    return row ? this.mapRow(row) : undefined;
  }

  findAll(offset = 0, limit = 50): Merchant[] {
    const rows = getDb().prepare(
      'SELECT * FROM merchants ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset) as any[];
    return rows.map(this.mapRow);
  }

  create(input: CreateMerchantInput): Merchant {
    const id = uuid();
    const trustedContacts = JSON.stringify([]);
    
    getDb().prepare(`
      INSERT INTO merchants (id, phone_number, country, name, business_name, trusted_contacts)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, input.phoneNumber, input.country, input.name, input.businessName, trustedContacts);

    return this.findById(id)!;
  }

  updateStatus(id: string, status: MerchantStatus): Merchant | undefined {
    getDb().prepare(`
      UPDATE merchants SET status = ?, updated_at = datetime('now') WHERE id = ?
    `).run(status, id);
    return this.findById(id);
  }

  setWalletAddress(id: string, address: string): Merchant | undefined {
    getDb().prepare(`
      UPDATE merchants SET wallet_address = ?, updated_at = datetime('now') WHERE id = ?
    `).run(address, id);
    return this.findById(id);
  }

  incrementTradeCounter(id: string, volume: string): void {
    getDb().prepare(`
      UPDATE merchants 
      SET total_trades = total_trades + 1, 
          total_volume = CAST(CAST(total_volume AS INTEGER) + CAST(? AS INTEGER) AS TEXT),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(volume, id);
  }

  private mapRow(row: any): Merchant {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      country: row.country,
      name: row.name,
      businessName: row.business_name,
      status: row.status as MerchantStatus,
      walletAddress: row.wallet_address || '',
      trustedContacts: JSON.parse(row.trusted_contacts || '[]'),
      totalTrades: row.total_trades,
      totalVolume: row.total_volume,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const merchantRepo = new MerchantRepository();