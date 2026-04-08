import { Request, Response, NextFunction } from 'express';
import { db } from '@workspace/db';
import { adminSessionsTable } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';

export interface AdminUser {
  role: 'owner' | 'manager' | 'support';
  name: string;
  staffId?: number;
  isOwnerPassword?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);

  // Owner password — full access
  if (adminPassword && token === adminPassword) {
    req.adminUser = { role: 'owner', name: 'Admin', isOwnerPassword: true };
    next();
    return;
  }

  // Staff session token
  try {
    const [session] = await db.select().from(adminSessionsTable).where(eq(adminSessionsTable.id, token));
    if (!session) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }
    if (new Date(session.expiresAt) < new Date()) {
      await db.delete(adminSessionsTable).where(eq(adminSessionsTable.id, token));
      res.status(401).json({ error: 'Session expired. Please sign in again.' });
      return;
    }
    req.adminUser = {
      role: session.role as AdminUser['role'],
      name: session.name,
      staffId: session.staffId,
    };
    next();
  } catch (err) {
    console.error('adminAuth error:', err);
    res.status(500).json({ error: 'Authentication error' });
  }
}

export function requireRole(...roles: AdminUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser || !roles.includes(req.adminUser.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
