/**
 * Amana Protocol - USSD Gateway Server
 * 
 * Connects GSM feature phones to the Amana backend via Africa's Talking API.
 * Handles USSD session callbacks, menu flow, and translates user text inputs
 * into API calls to the Merchant API and Relayer Service.
 * 
 * Africa's Talking USSD Callback Format:
 *   POST /ussd
 *   Body: { sessionId, serviceCode, phoneNumber, text }
 *   Response: { text: "...", type: "response" | "release" | "end" }
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ussdHandler } from './ussdHandler';

const app = express();
const PORT = parseInt(process.env.USSD_GATEWAY_PORT || '3002', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ─── Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true })); // Africa's Talking may send URL-encoded

// ─── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'amana-ussd-gateway',
      version: '0.1.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── USSD Callback (Africa's Talking) ──────────────────────────────
// Africa's Talking sends POST to this endpoint when a user dials *483#
app.post('/ussd', async (req: express.Request, res: express.Response) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  console.log(`[USSD] Session: ${sessionId}, Phone: ${phoneNumber}, Text: "${text}"`);

  if (!phoneNumber) {
    return res.status(400).json({ text: 'END Invalid request', type: 'release' });
  }

  try {
    const response = await ussdHandler.handle(phoneNumber, text || '', sessionId);
    console.log(`[USSD] Response: ${response.type} — ${response.text.substring(0, 50)}...`);
    return res.json(response);
  } catch (error) {
    console.error('[USSD] Handler error:', error);
    return res.json({
      text: 'END System error. Please try again later.',
      type: 'release',
    });
  }
});

// ─── Internal API (for admin dashboard relay) ──────────────────────
app.get('/api/ussd/simulate', async (req: express.Request, res: express.Response) => {
  // Simple GET-based simulation for development/testing
  const { phone, text } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'phone query param required' });
  }
  
  const response = await ussdHandler.handle(phone as string, (text as string) || '', 'sim-' + Date.now());
  return res.json({ success: true, data: response });
});

// ─── 404 Handler ───────────────────────────────────────────────────
app.use((_req: any, res: any) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// ─── Error Handler ─────────────────────────────────────────────────
app.use((err: Error, _req: any, res: any, _next: any) => {
  console.error('[USSD] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start ─────────────────────────────────────────────────────────
export function start(): void {
  app.listen(PORT, HOST, () => {
    console.log(`[USSD Gateway] Server running on http://${HOST}:${PORT}`);
    console.log(`[USSD Gateway] USSD callback: POST /ussd`);
    console.log(`[USSD Gateway] Simulate: GET /api/ussd/simulate?phone=...&text=...`);
  });
}

if (require.main === module) {
  start();
}

export { app };
export default { start };