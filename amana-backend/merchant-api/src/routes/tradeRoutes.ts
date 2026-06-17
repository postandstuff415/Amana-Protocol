/**
 * Amana Protocol - Trade Routes
 * 
 * REST endpoints for trade lifecycle management.
 * Called by the USSD gateway as merchants navigate the menu.
 */

import { Router, Request, Response } from 'express';
import { tradeService } from '../services/tradeService';

const router = Router();

/**
 * GET /api/trades
 * List all trades (admin).
 * Query: offset, limit
 */
router.get('/', (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const result = tradeService.list(offset, limit);
  return res.json(result);
});

/**
 * POST /api/trades
 * Create a new trade offer.
 * Body: { sellerId, buyerId, amount, currency, fiatEquivalent, fiatCurrency, description }
 */
router.post('/', (req: Request, res: Response) => {
  const { sellerId, buyerId, amount, currency, fiatEquivalent, fiatCurrency, description } = req.body;
  if (!sellerId || !buyerId || !amount || fiatEquivalent === undefined || !fiatCurrency || !description) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const result = tradeService.create({
    sellerId, buyerId, amount,
    currency: currency || 'USDC',
    fiatEquivalent, fiatCurrency, description,
  });
  return res.status(result.success ? 201 : 400).json(result);
});

/**
 * POST /api/trades/:id/fund
 * Buyer funds escrow.
 * Body: { escrowContractAddress, escrowId }
 */
router.post('/:id/fund', (req: Request, res: Response) => {
  const { escrowContractAddress, escrowId } = req.body;
  if (!escrowContractAddress || !escrowId) {
    return res.status(400).json({ success: false, error: 'escrowContractAddress and escrowId required' });
  }
  const result = tradeService.fund(req.params.id as string, escrowContractAddress, escrowId);
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/trades/:id/dispatch
 * Seller marks as dispatched/in-transit.
 */
router.post('/:id/dispatch', (req: Request, res: Response) => {
  const result = tradeService.markInTransit(req.params.id as string);
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/trades/:id/confirm-delivery
 * Buyer confirms delivery.
 */
router.post('/:id/confirm-delivery', (req: Request, res: Response) => {
  const result = tradeService.confirmDelivery(req.params.id as string);
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/trades/:id/complete
 * Complete trade (escrow released). Called by relayer after on-chain settlement.
 */
router.post('/:id/complete', (req: Request, res: Response) => {
  const result = tradeService.complete(req.params.id as string);
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/trades/:id/cancel
 * Cancel a trade before funding.
 */
router.post('/:id/cancel', (req: Request, res: Response) => {
  const result = tradeService.cancel(req.params.id as string);
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * GET /api/trades/:id
 * Get trade by ID.
 */
router.get('/:id', (req: Request, res: Response) => {
  const result = tradeService.getById(req.params.id as string);
  return res.status(result.success ? 200 : 404).json(result);
});

/**
 * GET /api/trades/merchant/:merchantId
 * Get all trades for a merchant.
 */
router.get('/merchant/:merchantId', (req: Request, res: Response) => {
  const result = tradeService.getByMerchant(req.params.merchantId as string);
  return res.json(result);
});

/**
 * GET /api/trades/merchant/:merchantId/active
 * Get active trades for a merchant.
 */
router.get('/merchant/:merchantId/active', (req: Request, res: Response) => {
  const result = tradeService.getActiveByMerchant(req.params.merchantId as string);
  return res.json(result);
});

export default router;