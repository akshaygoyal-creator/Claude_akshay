import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { withinGeofence } from '../utils/geo';
import { isLateCheckIn, isEarlyExit, todayString } from '../utils/shift';
import { io } from '../index';

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shiftId, latitude, longitude, loginMethod } = req.body;
  if (!shiftId || latitude == null || longitude == null || !loginMethod) {
    res.status(400).json({ error: 'shiftId, latitude, longitude, loginMethod required' }); return;
  }

  try {
    const emp = await prisma.employee.findUnique({ where: { id: req.user!.id }, include: { store: true } });
    if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }

    if (!withinGeofence(+latitude, +longitude, emp.store.latitude, emp.store.longitude, emp.store.geofenceRadius)) {
      res.status(400).json({
        error: `You are outside the store geofence (${emp.store.geofenceRadius}m radius). Please move closer to ${emp.store.name}.`,
      });
      return;
    }

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.storeId !== emp.storeId) {
      res.status(400).json({ error: 'Invalid shift for your store' }); return;
    }

    const today = todayString();
    const existing = await prisma.attendanceRecord.findUnique({
      where: { employeeId_shiftId_date: { employeeId: emp.id, shiftId, date: today } },
    });
    if (existing?.checkInTime) { res.status(400).json({ error: 'Already checked in for this shift today' }); return; }

    const now = new Date();
    const late = isLateCheckIn(shift.startTime, now);
    const status = late ? 'LATE' : 'PRESENT';

    const record = existing
      ? await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: { checkInTime: now, loginMethod, checkInLat: +latitude, checkInLng: +longitude, status },
          include: { employee: true, shift: true },
        })
      : await prisma.attendanceRecord.create({
          data: {
            id: uuidv4(),
            employeeId: emp.id,
            storeId: emp.storeId,
            shiftId,
            date: today,
            checkInTime: now,
            loginMethod,
            checkInLat: +latitude,
            checkInLng: +longitude,
            status,
          },
          include: { employee: true, shift: true },
        });

    io.to(`store:${emp.storeId}`).emit('attendance:update', { type: 'CHECK_IN', record });
    io.to('ops').emit('attendance:update', { type: 'CHECK_IN', record, storeId: emp.storeId });

    res.json({ message: late ? 'Checked in (Late)' : 'Checked in', isLate: late, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shiftId } = req.body;
  if (!shiftId) { res.status(400).json({ error: 'shiftId required' }); return; }

  try {
    const today = todayString();
    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_shiftId_date: { employeeId: req.user!.id, shiftId, date: today } },
      include: { shift: true, employee: true },
    });
    if (!record?.checkInTime) { res.status(400).json({ error: 'No check-in found for this shift' }); return; }
    if (record.checkOutTime) { res.status(400).json({ error: 'Already checked out' }); return; }

    const now = new Date();
    const early = isEarlyExit(record.shift.endTime, now);
    const status = early ? 'EARLY_EXIT' : record.status;

    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { checkOutTime: now, status },
      include: { employee: true, shift: true },
    });

    io.to(`store:${record.storeId}`).emit('attendance:update', { type: 'CHECK_OUT', record: updated });
    io.to('ops').emit('attendance:update', { type: 'CHECK_OUT', record: updated, storeId: record.storeId });

    res.json({ message: early ? 'Checked out (Early Exit)' : 'Checked out', isEarlyExit: early, record: updated });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const myAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { date, limit = '30' } = req.query;
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { employeeId: req.user!.id, ...(date && { date: date as string }) },
      include: { shift: true, store: true },
      orderBy: { date: 'desc' },
      take: +limit,
    });
    res.json(records);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const todayAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { employeeId: req.user!.id, date: todayString() },
      include: { shift: true },
    });
    res.json(records);
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const override = async (req: AuthRequest, res: Response): Promise<void> => {
  const { recordId } = req.params;
  const { status, reason } = req.body;
  if (!status || !reason) { res.status(400).json({ error: 'status and reason required' }); return; }
  try {
    const record = await prisma.attendanceRecord.findUnique({ where: { id: recordId } });
    if (!record) { res.status(404).json({ error: 'Record not found' }); return; }
    const updated = await prisma.attendanceRecord.update({
      where: { id: recordId },
      data: { status, overrideReason: reason, overriddenBy: req.user!.id },
      include: { employee: true, shift: true },
    });
    io.to(`store:${record.storeId}`).emit('attendance:update', { type: 'OVERRIDE', record: updated });
    res.json({ message: 'Override saved', record: updated });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const storeAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { storeId } = req.params;
  const { date } = req.query;
  const qDate = (date as string) || todayString();
  try {
    const [records, plans] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { storeId, date: qDate },
        include: { employee: true, shift: true },
        orderBy: [{ shift: { startTime: 'asc' } }, { employee: { name: 'asc' } }],
      }),
      prisma.manpowerPlan.findMany({ where: { storeId, date: qDate }, include: { shift: true } }),
    ]);
    res.json({ records, manpowerPlans: plans });
  } catch { res.status(500).json({ error: 'Server error' }); }
};
