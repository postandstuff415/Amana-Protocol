/**
 * Amana Protocol - Database Initialization
 * 
 * SQLite database for merchant records, trades, disputes.
 * Shared state accessible by all backend services.
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.AMANA_DB_PATH || path.join(__dirname, '../../../data/amana.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  
  const fs = require('fs');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  initializeSchema(db);
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      phone_number TEXT UNIQUE NOT NULL,
      country TEXT NOT NULL CHECK(country IN ('KE', 'UG', 'GH')),
      name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'suspended', 'banned')),
      wallet_address TEXT,
      trusted_contacts TEXT DEFAULT '[]',
      total_trades INTEGER DEFAULT 0,
      total_volume TEXT DEFAULT '0',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES merchants(id),
      buyer_id TEXT NOT NULL REFERENCES merchants(id),
      amount TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USDC',
      fiat_equivalent REAL NOT NULL,
      fiat_currency TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'offer_created' CHECK(status IN (
        'offer_created', 'buyer_funded', 'in_transit', 'delivery_confirmed',
        'completed', 'dispute_opened', 'dispute_resolved', 'cancelled', 'refunded'
      )),
      escrow_contract_address TEXT,
      escrow_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      trade_id TEXT NOT NULL REFERENCES trades(id),
      filed_by TEXT NOT NULL REFERENCES merchants(id),
      tier TEXT NOT NULL CHECK(tier IN ('micro', 'macro')),
      reason TEXT NOT NULL,
      evidence TEXT,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'under_review', 'resolved')),
      resolution TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      phone_number TEXT NOT NULL,
      merchant_id TEXT REFERENCES merchants(id),
      current_screen TEXT NOT NULL DEFAULT 'welcome',
      menu_stack TEXT DEFAULT '[]',
      data TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_trades_seller ON trades(seller_id);
    CREATE INDEX IF NOT EXISTS idx_trades_buyer ON trades(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
    CREATE INDEX IF NOT EXISTS idx_disputes_trade ON disputes(trade_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_phone ON sessions(phone_number);
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}