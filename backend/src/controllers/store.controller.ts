import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await prisma.store.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }));
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: { employees: { where: { isActive: true } }, shifts: { where: { isActive: true } } },
    });
    if (!store) { res.status(404).json({ error: 'Store not found' }); return; }
    res.json(store);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { storeCode, name, latitude, longitude, address, city, geofenceRadius } = req.body;
  try {
    const store = await prisma.store.create({
      data: { id: uuidv4(), storeCode, name, latitude, longitude, address, city, geofenceRadius: geofenceRadius ?? 100 },
    });
    res.status(201).json(store);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') { res.status(400).json({ error: 'Store code already exists' }); return; }
    res.status(500).json({ error: 'Server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = await prisma.store.update({ where: { id: req.params.id }, data: req.body });
    res.json(store);
  } catch { res.status(500).json({ error: 'Server error' }); }
};
