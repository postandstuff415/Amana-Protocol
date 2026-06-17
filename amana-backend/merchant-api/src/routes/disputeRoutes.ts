/**
 * Amana Protocol - Dispute Routes
 * 
 * REST endpoints for the Two-Tier Dispute Engine.
 * Micro claims auto-resolve; macro disputes require admin review.
 */

import { Router, Request, Response } from 'express';
import { disputeService } from '../services/disputeService';

const router = Router();

/**
 * GET /api/disputes
 * List all disputes (admin).
 * Query: offset, limit
 */
router.get('/', (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const result = disputeService.list(offset, limit);
  return res.json(result);
});

/**
 * POST /api/disputes
 * File a dispute.
 * Body: { tradeId, filedBy, tier?, reason, evidence? }
 */
router.post('/', (req: Request, res: Response) => {
  const { tradeId, filedBy, tier, reason, evidence } = req.body;
  if (!tradeId || !filedBy || !reason) {
    return res.status(400).json({ success: false, error: 'Missing required fields: tradeId, filedBy, reason' });
  }
  const result = disputeService.file({ tradeId, filedBy, tier, reason, evidence });
  return res.status(result.success ? 201 : 400).json(result);
});

/**
 * POST /api/disputes/:id/resolve
 * Admin resolves a macro dispute.
 * Body: { resolution, resolveInFavorOfBuyer }
 */
router.post('/:id/resolve', (req: Request, res: Response) => {
  const { resolution, resolveInFavorOfBuyer } = req.body;
  if (!resolution) return res.status(400).json({ success: false, error: 'resolution required' });
  const result = disputeService.resolve(req.params.id as string, resolution, resolveInFavorOfBuyer === true);
  return res.status(result.success ? 200 : 400).json(result);
});

/**
 * GET /api/disputes/:id
 * Get dispute by ID.
 */
router.get('/:id', (req: Request, res: Response) => {
  const result = disputeService.getById(req.params.id as string);
  return res.status(result.success ? 200 : 404).json(result);
});

/**
 * GET /api/disputes/trade/:tradeId
 * Get disputes for a trade.
 */
router.get('/trade/:tradeId', (req: Request, res: Response) => {
  const result = disputeService.getByTrade(req.params.tradeId as string);
  return res.json(result);
});

/**
 * GET /api/disputes/merchant/:merchantId
 * Get disputes filed by a merchant.
 */
router.get('/merchant/:merchantId', (req: Request, res: Response) => {
  const result = disputeService.getByMerchant(req.params.merchantId as string);
  return res.json(result);
});

export default router;