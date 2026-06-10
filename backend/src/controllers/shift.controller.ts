import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { storeId } = req.query;
  try {
    const shifts = await prisma.shift.findMany({
      where: { isActive: true, ...(storeId && { storeId: storeId as string }) },
      include: { store: { select: { id: true, name: true } } },
      orderBy: { startTime: 'asc' },
    });
    res.json(shifts);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { shiftCode, name, startTime, endTime, storeId } = req.body;
  try {
    const s = await prisma.shift.create({
      data: { id: uuidv4(), shiftCode, name, startTime, endTime, storeId },
      include: { store: true },
    });
    res.status(201).json(s);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') { res.status(400).json({ error: 'Shift code exists for this store' }); return; }
    res.status(500).json({ error: 'Server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const s = await prisma.shift.update({ where: { id: req.params.id }, data: req.body, include: { store: true } });
    res.json(s);
  } catch { res.status(500).json({ error: 'Server error' }); }
};
