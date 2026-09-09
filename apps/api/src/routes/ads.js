import express from 'express';
import { requireAuth, requireEarningAccess } from '../middleware/auth.js';
import defaultMonetagService from '../services/monetagService.js';
import { config } from '../config/index.js';

const router = express.Router();

router.post('/claim', requireAuth, requireEarningAccess, async (_req, res) => {
  return res.status(503).json({
    success: false,
    message: 'ক্লায়েন্ট থেকে সরাসরি বিজ্ঞাপন রিওয়ার্ড ক্লেইম করা যায় না। সার্ভার-সাইড verification ছাড়া ব্যালেন্স যোগ হবে না।'
  });
});

router.post('/postback', async (req, res) => {
  try {
    const signature = req.headers['x-monetag-signature'];
    if (!config.monetagRewardEnabled) {
      return res.status(503).json({ success: false, message: 'Monetag reward verification is disabled.' });
    }
    if (!defaultMonetagService.verifyPostbackSignature(req.body, signature)) {
      return res.status(403).json({ success: false, message: 'Invalid signature' });
    }
    return res.json({
      success: true,
      credited: false,
      message: 'Postback accepted but financial credit stays disabled until official verification is configured.'
    });
  } catch {
    return res.status(500).json({ success: false });
  }
});

export default router;
