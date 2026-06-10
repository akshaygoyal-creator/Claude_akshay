import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { storeId, shiftId, date } = req.query;
  try {
    const plans = await prisma.manpowerPlan.findMany({
      where: {
        ...(storeId && { storeId: storeId as string }),
        ...(shiftId && { shiftId: shiftId as string }),
        ...(date    && { date: date as string }),
      },
      include: { shift: true, store: { select: { id: true, name: true } } },
      orderBy: [{ date: 'asc' }, { shift: { startTime: 'asc' } }],
    });
    res.json(plans);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const upsert = async (req: Request, res: Response): Promise<void> => {
  const { storeId, shiftId, role, plannedCount, date } = req.body;
  if (!storeId || !shiftId || !role || plannedCount == null || !date) {
    res.status(400).json({ error: 'storeId, shiftId, role, plannedCount, date required' }); return;
  }
  try {
    const plan = await prisma.manpowerPlan.upsert({
      where: { storeId_shiftId_role_date: { storeId, shiftId, role, date } },
      update: { plannedCount: Number(plannedCount) },
      create: { id: uuidv4(), storeId, shiftId, role, plannedCount: Number(plannedCount), date },
      include: { shift: true, store: { select: { id: true, name: true } } },
    });
    res.json(plan);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const bulkUpsert = async (req: Request, res: Response): Promise<void> => {
  const { plans } = req.body;
  if (!Array.isArray(plans)) { res.status(400).json({ error: 'plans must be array' }); return; }
  try {
    const results = await Promise.all(
      (plans as Array<{ storeId: string; shiftId: string; role: 'STORE_MANAGER' | 'SHIFT_SUPERVISOR' | 'MEAT_TECHNICIAN'; plannedCount: number; date: string }>).map(p =>
        prisma.manpowerPlan.upsert({
          where: { storeId_shiftId_role_date: { storeId: p.storeId, shiftId: p.shiftId, role: p.role, date: p.date } },
          update: { plannedCount: p.plannedCount },
          create: { id: uuidv4(), ...p },
        })
      ),
    );
    res.json(results);
  } catch { res.status(500).json({ error: 'Server error' }); }
};
