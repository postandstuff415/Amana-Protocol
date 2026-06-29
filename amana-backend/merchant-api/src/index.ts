/**
 * Amana Protocol - Merchant API Server
 * 
 * REST API for merchant management, trade lifecycle, disputes, and balance queries.
 * Used internally by the USSD Gateway and externally by the admin dashboard.
 * 
 * All endpoints return JSON with the ApiResponse envelope.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getDb, closeDb } from './database/init';
import merchantRoutes from './routes/merchantRoutes';
import tradeRoutes from './routes/tradeRoutes';
import disputeRoutes from './routes/disputeRoutes';
import yieldRoutes from './routes/yieldRoutes';

const app = express();
const PORT = parseInt(process.env.MERCHANT_API_PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ─── Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ─── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'amana-merchant-api',
      version: '0.1.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Routes ────────────────────────────────────────────────────────
app.use('/api/merchants', merchantRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/yield', yieldRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// ─── Error Handler ─────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[MerchantAPI] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start ─────────────────────────────────────────────────────────
export function start(): void {
  // Initialize database
  getDb();
  console.log('[MerchantAPI] Database initialized');

  app.listen(PORT, HOST, () => {
    console.log(`[MerchantAPI] Server running on http://${HOST}:${PORT}`);
    console.log(`[MerchantAPI] Endpoints:`);
    console.log(`  GET  /api/health`);
    console.log(`  POST /api/merchants/register`);
    console.log(`  POST /api/merchants/activate`);
    console.log(`  GET  /api/merchants`);
    console.log(`  GET  /api/merchants/:id`);
    console.log(`  GET  /api/merchants/phone/:phone`);
    console.log(`  POST /api/merchants/:id/wallet`);
    console.log(`  POST /api/merchants/:id/suspend`);
    console.log(`  POST /api/trades`);
    console.log(`  POST /api/trades/:id/fund`);
    console.log(`  POST /api/trades/:id/dispatch`);
    console.log(`  POST /api/trades/:id/confirm-delivery`);
    console.log(`  POST /api/trades/:id/complete`);
    console.log(`  POST /api/trades/:id/cancel`);
    console.log(`  GET  /api/trades/:id`);
    console.log(`  GET  /api/trades/merchant/:merchantId`);
    console.log(`  POST /api/disputes`);
    console.log(`  POST /api/disputes/:id/resolve`);
    console.log(`  GET  /api/disputes/:id`);
    console.log(`  GET  /api/disputes/trade/:tradeId`);
  });
}

// Allow running directly or importing
if (require.main === module) {
  start();
}

export { app };
export default { start };