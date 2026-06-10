import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; storeId: string; email: string };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'No token' }); return; }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; role: string; storeId: string; email: string;
    };
    const emp = await prisma.employee.findUnique({ where: { id: payload.id } });
    if (!emp || !emp.isActive) { res.status(401).json({ error: 'Account inactive' }); return; }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
