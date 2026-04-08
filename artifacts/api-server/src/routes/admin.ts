import { Router } from 'express';
import { db } from '@workspace/db';
import { ordersTable, contactEnquiriesTable, couponsTable } from '@workspace/db/schema';
import { eq, desc } from 'drizzle-orm';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.use(adminAuth);

// ── Orders ──────────────────────────────────────────────────────────────────

router.get('/orders', async (_req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

router.patch('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status' });
      return;
    }
    const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    res.json({ success: true, order: updated });
  } catch (err) {
    console.error('Admin update order error:', err);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

// ── Enquiries ────────────────────────────────────────────────────────────────

router.get('/enquiries', async (_req, res) => {
  try {
    const enquiries = await db.select().from(contactEnquiriesTable).orderBy(desc(contactEnquiriesTable.createdAt));
    res.json({ success: true, enquiries });
  } catch (err) {
    console.error('Admin enquiries error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

router.patch('/enquiries/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status' });
      return;
    }
    const [updated] = await db.update(contactEnquiriesTable).set({ status }).where(eq(contactEnquiriesTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ success: false, error: 'Enquiry not found' });
      return;
    }
    res.json({ success: true, enquiry: updated });
  } catch (err) {
    console.error('Admin update enquiry error:', err);
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
});

// ── Coupons ──────────────────────────────────────────────────────────────────

router.get('/coupons', async (_req, res) => {
  try {
    const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
    res.json({ success: true, coupons });
  } catch (err) {
    console.error('Admin coupons error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch coupons' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, expiresAt, active } = req.body;
    if (!code || !discountType || discountValue === undefined) {
      res.status(400).json({ success: false, error: 'code, discountType, and discountValue are required' });
      return;
    }
    if (!['percentage', 'fixed'].includes(discountType)) {
      res.status(400).json({ success: false, error: 'discountType must be percentage or fixed' });
      return;
    }
    const [coupon] = await db.insert(couponsTable).values({
      code: String(code).toUpperCase().trim(),
      description: description ?? null,
      discountType,
      discountValue: String(discountValue),
      minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active !== false,
    }).returning();
    res.json({ success: true, coupon });
  } catch (err: any) {
    if (err?.code === '23505') {
      res.status(409).json({ success: false, error: 'A coupon with that code already exists' });
      return;
    }
    console.error('Admin create coupon error:', err);
    res.status(500).json({ success: false, error: 'Failed to create coupon' });
  }
});

router.patch('/coupons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { description, discountType, discountValue, minOrderAmount, maxUses, expiresAt, active } = req.body;
    const updates: Record<string, unknown> = {};
    if (description !== undefined) updates.description = description;
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = String(discountValue);
    if (minOrderAmount !== undefined) updates.minOrderAmount = minOrderAmount ? String(minOrderAmount) : null;
    if (maxUses !== undefined) updates.maxUses = maxUses ? parseInt(maxUses) : null;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (active !== undefined) updates.active = Boolean(active);
    const [updated] = await db.update(couponsTable).set(updates).where(eq(couponsTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ success: false, error: 'Coupon not found' });
      return;
    }
    res.json({ success: true, coupon: updated });
  } catch (err) {
    console.error('Admin update coupon error:', err);
    res.status(500).json({ success: false, error: 'Failed to update coupon' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(couponsTable).where(eq(couponsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete coupon error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete coupon' });
  }
});

export default router;
