import { Router } from 'express';
import { db } from '@workspace/db';
import { couponsTable } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/validate-coupon', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: 'Coupon code is required' });
      return;
    }

    const [coupon] = await db.select().from(couponsTable)
      .where(eq(couponsTable.code, String(code).toUpperCase().trim()));

    if (!coupon) {
      res.status(404).json({ success: false, error: 'Coupon code not found' });
      return;
    }

    if (!coupon.active) {
      res.status(400).json({ success: false, error: 'This coupon is no longer active' });
      return;
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      res.status(400).json({ success: false, error: 'This coupon has expired' });
      return;
    }

    if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) {
      res.status(400).json({ success: false, error: 'This coupon has reached its usage limit' });
      return;
    }

    const orderSubtotal = parseFloat(String(subtotal ?? 0));
    const minOrder = coupon.minOrderAmount ? parseFloat(String(coupon.minOrderAmount)) : 0;
    if (minOrder > 0 && orderSubtotal < minOrder) {
      res.status(400).json({
        success: false,
        error: `Minimum order of $${minOrder.toFixed(2)} required for this coupon`,
      });
      return;
    }

    const value = parseFloat(String(coupon.discountValue));
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = parseFloat(((orderSubtotal * value) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(value, orderSubtotal);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: value,
        discountAmount,
      },
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    res.status(500).json({ success: false, error: 'Failed to validate coupon' });
  }
});

export default router;
