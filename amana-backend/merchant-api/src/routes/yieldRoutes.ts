import { Router } from 'express';
import { yieldService } from '../services/yieldService';

const router = Router();

/**
 * GET /api/yield
 * Returns real-time yield and liquidity statistics for the Amana Protocol.
 */
router.get('/', async (_req, res) => {
  const result = await yieldService.getYieldStats();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;
