import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';

const strip = (e: Record<string, unknown>) => { const { passwordHash: _, ...r } = e; return r; };

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { storeId, role, type } = req.query;
  try {
    const rows = await prisma.employee.findMany({
      where: {
        isActive: true,
        ...(storeId && { storeId: storeId as string }),
        ...(role   && { role: role as 'STORE_MANAGER' | 'SHIFT_SUPERVISOR' | 'MEAT_TECHNICIAN' }),
        ...(type   && { type: type as 'FULL_TIME' | 'PART_TIME' }),
      },
      include: { store: { select: { id: true, name: true, city: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(rows.map(e => strip(e as unknown as Record<string, unknown>)));
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const e = await prisma.employee.findUnique({ where: { id: req.params.id }, include: { store: true } });
    if (!e) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(strip(e as unknown as Record<string, unknown>));
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { employeeCode, name, email, phone, password, type, role, storeId } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password || 'Licious@123', 10);
    const e = await prisma.employee.create({
      data: { id: uuidv4(), employeeCode, name, email, phone, passwordHash, type, role, storeId, faceDataRef: `face_${uuidv4()}` },
      include: { store: true },
    });
    res.status(201).json(strip(e as unknown as Record<string, unknown>));
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') { res.status(400).json({ error: 'Duplicate email/phone/code' }); return; }
    res.status(500).json({ error: 'Server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { password, ...rest } = req.body;
  try {
    const data: Record<string, unknown> = { ...rest };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    const e = await prisma.employee.update({ where: { id: req.params.id }, data, include: { store: true } });
    res.json(strip(e as unknown as Record<string, unknown>));
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const deactivate = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.employee.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Deactivated' });
  } catch { res.status(500).json({ error: 'Server error' }); }
};
