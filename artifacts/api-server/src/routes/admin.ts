import { Router } from 'express';
import { db } from '@workspace/db';
import { ordersTable, contactEnquiriesTable, couponsTable, staffTable, adminSessionsTable } from '@workspace/db/schema';
import { eq, desc } from 'drizzle-orm';
import { adminAuth, requireRole } from '../middleware/adminAuth.js';
import { generateSalt, hashPassword, verifyPassword, generateSessionId, SESSION_TTL_HOURS } from '../lib/auth.js';

const router = Router();

// ── Auth (unprotected) ───────────────────────────────────────────────────────

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!password) {
    res.status(400).json({ success: false, error: 'Password is required' });
    return;
  }

  // Owner login (no username or username = "admin")
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!username || username === 'admin') {
    if (adminPassword && password === adminPassword) {
      const token = adminPassword; // owner uses password as token for backwards compat
      res.json({ success: true, token, role: 'owner', name: 'Admin' });
      return;
    }
  }

  // Staff login
  if (username) {
    try {
      const [staff] = await db.select().from(staffTable)
        .where(eq(staffTable.username, String(username).trim().toLowerCase()));
      if (!staff || !staff.active) {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
        return;
      }
      if (!verifyPassword(password, staff.passwordSalt, staff.passwordHash)) {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
        return;
      }
      // Create session
      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
      await db.insert(adminSessionsTable).values({
        id: sessionId,
        staffId: staff.id,
        role: staff.role,
        name: staff.name,
        expiresAt,
      });
      res.json({ success: true, token: sessionId, role: staff.role, name: staff.name });
      return;
    } catch (err) {
      console.error('Staff login error:', err);
      res.status(500).json({ success: false, error: 'Login failed' });
      return;
    }
  }

  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

router.post('/auth/logout', adminAuth, async (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token && !req.adminUser?.isOwnerPassword) {
    try {
      await db.delete(adminSessionsTable).where(eq(adminSessionsTable.id, token));
    } catch { /* ignore */ }
  }
  res.json({ success: true });
});

router.get('/auth/me', adminAuth, (req, res) => {
  res.json({ success: true, user: req.adminUser });
});

// All routes below require auth ───────────────────────────────────────────────

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

router.patch('/orders/:id', requireRole('owner', 'manager', 'support'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status' });
      return;
    }
    const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!updated) { res.status(404).json({ success: false, error: 'Order not found' }); return; }
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
    if (!updated) { res.status(404).json({ success: false, error: 'Enquiry not found' }); return; }
    res.json({ success: true, enquiry: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
});

router.post('/enquiries/:id/reply', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { replyText } = req.body;
    if (!replyText?.trim()) {
      res.status(400).json({ success: false, error: 'Reply message is required' });
      return;
    }

    const [enquiry] = await db.select().from(contactEnquiriesTable).where(eq(contactEnquiriesTable.id, id));
    if (!enquiry) { res.status(404).json({ success: false, error: 'Enquiry not found' }); return; }
    if (!enquiry.email) {
      res.status(400).json({ success: false, error: 'This enquiry has no email address to reply to' });
      return;
    }

    const { getResendClient } = await import('../lib/resend.js');
    const { client, fromEmail } = getResendClient();

    await client.emails.send({
      from: `Reigns Kitchen <${fromEmail}>`,
      to: [enquiry.email],
      replyTo: fromEmail,
      subject: `Re: Your message to Reigns Kitchen`,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f5f5dc;margin:0;padding:20px;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:#1a2235;padding:20px 24px;">
            <h2 style="color:#FFD700;margin:0;font-size:18px;">Reigns Kitchen</h2>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 16px;color:#444;">Hi ${enquiry.name},</p>
            <div style="white-space:pre-wrap;color:#222;font-size:14px;line-height:1.6;">${replyText.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
            <p style="margin:0 0 6px;color:#999;font-size:12px;">Your original message:</p>
            <div style="background:#f9f7f0;padding:12px;border-radius:8px;font-size:12px;color:#666;">${enquiry.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <p style="margin:20px 0 0;font-size:13px;color:#555;">— Chef April Winston, Reigns Kitchen</p>
          </div>
        </div>
      </body></html>`,
    });

    const [updated] = await db.update(contactEnquiriesTable)
      .set({ status: 'replied', replyText: replyText.trim() })
      .where(eq(contactEnquiriesTable.id, id))
      .returning();

    res.json({ success: true, enquiry: updated });
  } catch (err: any) {
    console.error('Reply error:', err);
    res.status(500).json({ success: false, error: err?.message ?? 'Failed to send reply' });
  }
});

// ── Coupons ──────────────────────────────────────────────────────────────────

router.get('/coupons', async (_req, res) => {
  try {
    const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch coupons' });
  }
});

router.post('/coupons', requireRole('owner', 'manager'), async (req, res) => {
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
    res.status(500).json({ success: false, error: 'Failed to create coupon' });
  }
});

router.patch('/coupons/:id', requireRole('owner', 'manager'), async (req, res) => {
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
    if (!updated) { res.status(404).json({ success: false, error: 'Coupon not found' }); return; }
    res.json({ success: true, coupon: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update coupon' });
  }
});

router.delete('/coupons/:id', requireRole('owner', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(couponsTable).where(eq(couponsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete coupon' });
  }
});

// ── Staff (owner only) ────────────────────────────────────────────────────────

router.get('/staff', requireRole('owner'), async (_req, res) => {
  try {
    const staff = await db.select({
      id: staffTable.id, name: staffTable.name, username: staffTable.username,
      email: staffTable.email, role: staffTable.role, active: staffTable.active,
      createdAt: staffTable.createdAt,
    }).from(staffTable).orderBy(desc(staffTable.createdAt));
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch staff' });
  }
});

router.post('/staff', requireRole('owner'), async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !password) {
      res.status(400).json({ success: false, error: 'name, username, and password are required' });
      return;
    }
    const validRoles = ['manager', 'support'];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ success: false, error: 'role must be manager or support' });
      return;
    }
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const [staff] = await db.insert(staffTable).values({
      name: String(name).trim(),
      username: String(username).trim().toLowerCase(),
      email: email ? String(email).trim() : null,
      passwordHash,
      passwordSalt: salt,
      role: role ?? 'support',
    }).returning({ id: staffTable.id, name: staffTable.name, username: staffTable.username, email: staffTable.email, role: staffTable.role, active: staffTable.active, createdAt: staffTable.createdAt });
    res.json({ success: true, staff });
  } catch (err: any) {
    if (err?.code === '23505') {
      res.status(409).json({ success: false, error: 'Username already taken' });
      return;
    }
    console.error('Create staff error:', err);
    res.status(500).json({ success: false, error: 'Failed to create staff member' });
  }
});

router.patch('/staff/:id', requireRole('owner'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, password, role, active } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (email !== undefined) updates.email = email ? String(email).trim() : null;
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = Boolean(active);
    if (password) {
      const salt = generateSalt();
      updates.passwordHash = hashPassword(password, salt);
      updates.passwordSalt = salt;
    }
    const [updated] = await db.update(staffTable).set(updates).where(eq(staffTable.id, id))
      .returning({ id: staffTable.id, name: staffTable.name, username: staffTable.username, email: staffTable.email, role: staffTable.role, active: staffTable.active });
    if (!updated) { res.status(404).json({ success: false, error: 'Staff not found' }); return; }
    res.json({ success: true, staff: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update staff member' });
  }
});

router.delete('/staff/:id', requireRole('owner'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(staffTable).set({ active: false }).where(eq(staffTable.id, id));
    await db.delete(adminSessionsTable).where(eq(adminSessionsTable.staffId, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to deactivate staff member' });
  }
});

export default router;
