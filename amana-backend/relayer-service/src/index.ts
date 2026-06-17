/**
 * Amana Protocol - Relayer Service Server
 * 
 * REST API for wallet registration, gas sponsorship, and on-chain interaction.
 * Acts as the bridge between the Merchant API and the blockchain.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { walletService } from './walletService';
import { relayer } from './relayer';
import { SUPPORTED_CHAINS, DEFAULT_ENTRYPOINT } from './bundlerClient';

const app = express();
const PORT = parseInt(process.env.RELAYER_PORT || '3003', 10);
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
      service: 'amana-relayer',
      version: '0.1.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Wallet Routes ─────────────────────────────────────────────────

/**
 * POST /api/relayer/wallet/register
 * Register a phone → wallet mapping.
 * Body: { phoneNumber, merchantId }
 */
app.post('/api/relayer/wallet/register', (req: any, res: any) => {
  const { phoneNumber, merchantId } = req.body;
  if (!phoneNumber || !merchantId) {
    return res.status(400).json({ success: false, error: 'phoneNumber and merchantId required' });
  }

  const existing = walletService.getByPhone(phoneNumber);
  if (existing) {
    return res.json({ success: true, data: existing, message: 'Wallet already registered' });
  }

  const mapping = walletService.register(phoneNumber, merchantId);
  return res.status(201).json({ success: true, data: mapping });
});

/**
 * GET /api/relayer/wallet/:phoneNumber
 * Get wallet mapping for a phone number.
 */
app.get('/api/relayer/wallet/:phoneNumber', (req: any, res: any) => {
  const mapping = walletService.getByPhone(req.params.phoneNumber as string);
  if (!mapping) return res.status(404).json({ success: false, error: 'Wallet not found' });
  return res.json({ success: true, data: mapping });
});

/**
 * GET /api/relayer/wallet/merchant/:merchantId
 * Get wallet by merchant ID.
 */
app.get('/api/relayer/wallet/merchant/:merchantId', (req: any, res: any) => {
  const mapping = walletService.getByMerchantId(req.params.merchantId as string);
  if (!mapping) return res.status(404).json({ success: false, error: 'Wallet not found' });
  return res.json({ success: true, data: mapping });
});

/**
 * GET /api/relayer/wallets
 * List all registered wallets.
 */
app.get('/api/relayer/wallets', (_req: any, res: any) => {
  const wallets = walletService.getAll();
  return res.json({ success: true, data: wallets, count: wallets.length });
});

// ─── Gas Sponsorship Routes ────────────────────────────────────────

/**
 * POST /api/relayer/sponsor
 * Sponsor a gasless transaction.
 * Body: { phoneNumber, action, tradeId?, amount?, escrowAddress? }
 */
app.post('/api/relayer/sponsor', async (req: any, res: any) => {
  const { phoneNumber, action, tradeId, amount, escrowAddress } = req.body;
  if (!phoneNumber || !action) {
    return res.status(400).json({ success: false, error: 'phoneNumber and action required' });
  }

  try {
    const result = await relayer.sponsorTransaction({
      phoneNumber,
      action,
      tradeId,
      amount,
      escrowAddress,
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('[Relayer] Sponsor error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Sponsorship failed' });
  }
});

/**
 * GET /api/relayer/derive/:phoneNumber
 * Derive wallet address for a phone number (deterministic, without registration).
 */
app.get('/api/relayer/derive/:phoneNumber', (req: any, res: any) => {
  const address = walletService.deriveAddress(req.params.phoneNumber as string);
  return res.json({
    success: true,
    data: { phoneNumber: req.params.phoneNumber, walletAddress: address },
  });
});

// ─── Config & Status ───────────────────────────────────────────────

/**
 * GET /api/relayer/config
 * Show relayer configuration (without secrets).
 */
app.get('/api/relayer/config', (_req: any, res: any) => {
  const chainId = parseInt(process.env.CHAIN_ID || '84532', 10);
  const chain = SUPPORTED_CHAINS[chainId];
  res.json({
    success: true,
    data: {
      chainId,
      chainName: chain?.name || 'unknown',
      entryPoint: process.env.ENTRYPOINT_ADDRESS || DEFAULT_ENTRYPOINT,
      bundlerUrl: chain?.bundlerUrl || 'not configured',
      sponsorAddress: relayer.getSponsorAddress(),
      rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
    },
  });
});

/**
 * GET /api/relayer/status
 * Get relayer status and sponsor balance.
 */
app.get('/api/relayer/status', async (_req: any, res: any) => {
  try {
    const sponsorBalance = await relayer.getSponsorBalance();
    const wallets = walletService.getAll();
    const deployed = wallets.filter(w => w.isDeployed).length;
    const pending = wallets.length - deployed;

    res.json({
      success: true,
      data: {
        sponsorAddress: relayer.getSponsorAddress(),
        sponsorBalanceEth: sponsorBalance,
        totalWallets: wallets.length,
        deployedWallets: deployed,
        pendingDeployments: pending,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── 404 Handler ───────────────────────────────────────────────────
app.use((_req: any, res: any) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// ─── Error Handler ─────────────────────────────────────────────────
app.use((err: Error, _req: any, res: any, _next: any) => {
  console.error('[Relayer] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start ─────────────────────────────────────────────────────────
export function start(): void {
  app.listen(PORT, HOST, () => {
    console.log(`[Relayer Service] Server running on http://${HOST}:${PORT}`);
    console.log(`[Relayer Service] Endpoints:`);
    console.log(`  POST /api/relayer/wallet/register`);
    console.log(`  GET  /api/relayer/wallet/:phone`);
    console.log(`  GET  /api/relayer/wallet/merchant/:id`);
    console.log(`  GET  /api/relayer/wallets`);
    console.log(`  POST /api/relayer/sponsor`);
    console.log(`  GET  /api/relayer/derive/:phone`);
    console.log(`  GET  /api/relayer/config`);
    console.log(`  GET  /api/relayer/status`);
    console.log(`[Relayer] Sponsor address: ${relayer.getSponsorAddress()}`);
    console.log(`[Relayer] EntryPoint: ${process.env.ENTRYPOINT_ADDRESS || DEFAULT_ENTRYPOINT}`);
  });
}

if (require.main === module) {
  start();
}

export { app };
export default { start };