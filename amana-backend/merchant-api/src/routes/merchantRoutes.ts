/**
 * Amana Protocol - Merchant Routes
 * 
 * REST endpoints for merchant management.
 * Used by the USSD gateway (internal) and admin dashboard.
 */

import { Router, Request, Response } from 'express';
import { merchantService } from '../services/merchantService';

const router = Router();

/**
 * POST /api/merchants/register
 * Register a new merchant (via USSD onboarding).
 * Body: { phoneNumber, country, name, businessName }
 */
router.post('/register', (req: Request, res: Response) => {
  const { phoneNumber, country, name, businessName } = req.body;
  if (!phoneNumber || !country || !name || !businessName) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const result = merchantService.register({ phoneNumber, country, name, businessName });
  const status = result.success ? 200 : 400;
  return res.status(status).json(result);
});

/**
 * POST /api/merchants/activate
 * Activate a merchant after SIM verification.
 * Body: { phoneNumber }
 */
router.post('/activate', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ success: false, error: 'phoneNumber required' });
  const result = merchantService.activate(phoneNumber);
  return res.status(result.success ? 200 : 404).json(result);
});

/**
 * GET /api/merchants/:id
 * Get merchant by ID.
 */
router.get('/:id', (req: Request, res: Response) => {
  const result = merchantService.getById(req.params.id as string);
  return res.status(result.success ? 200 : 404).json(result);
});

/**
 * GET /api/merchants/phone/:phoneNumber
 * Get merchant by phone number.
 */
router.get('/phone/:phoneNumber', (req: Request, res: Response) => {
  const result = merchantService.getByPhone(req.params.phoneNumber as string);
  return res.status(result.success ? 200 : 404).json(result);
});

/**
 * GET /api/merchants
 * List all merchants (admin).
 * Query: offset, limit
 */
router.get('/', (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const result = merchantService.list(offset, limit);
  return res.json(result);
});

/**
 * POST /api/merchants/:id/wallet
 * Link a wallet address to a merchant.
 * Body: { walletAddress }
 */
router.post('/:id/wallet', (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ success: false, error: 'walletAddress required' });
  
  const merchant = merchantService.getById(req.params.id as string);
  if (!merchant.success) return res.status(404).json(merchant);
  
  const result = merchantService.linkWallet(merchant.data!.phoneNumber, walletAddress);
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/merchants/:id/suspend
 * Suspend a merchant (admin).
 */
router.post('/:id/suspend', (req: Request, res: Response) => {
  const result = merchantService.suspend(req.params.id as string);
  return res.status(result.success ? 200 : 404).json(result);
});

export default router;