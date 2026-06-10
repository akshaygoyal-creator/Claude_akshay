import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { todayString } from '../utils/shift';
import { AuthRequest } from '../middleware/auth';

type Indicator = 'GREEN' | 'AMBER' | 'RED';
const indicator = (present: number, planned: number): Indicator => {
  if (planned === 0) return 'GREEN';
  const pct = (present / planned) * 100;
  return pct >= 90 ? 'GREEN' : pct >= 70 ? 'AMBER' : 'RED';
};

const ROLES = ['STORE_MANAGER', 'SHIFT_SUPERVISOR', 'MEAT_TECHNICIAN'] as const;

export const storeDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const { storeId } = req.params;
  const qDate = (req.query.date as string) || todayString();
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) { res.status(404).json({ error: 'Store not found' }); return; }

    const [records, plans, shifts, employees] = await Promise.all([
      prisma.attendanceRecord.findMany({ where: { storeId, date: qDate }, include: { employee: true, shift: true } }),
      prisma.manpowerPlan.findMany({ where: { storeId, date: qDate }, include: { shift: true } }),
      prisma.shift.findMany({ where: { storeId, isActive: true } }),
      prisma.employee.findMany({ where: { storeId, isActive: true } }),
    ]);

    const isPresent = (status: string) => status === 'PRESENT' || status === 'LATE';

    const shiftBreakdown = shifts.map(shift => {
      const shiftRecords = records.filter(r => r.shiftId === shift.id);
      const shiftPlans = plans.filter(p => p.shiftId === shift.id);
      const totalPlanned = shiftPlans.reduce((s, p) => s + p.plannedCount, 0);
      const present = shiftRecords.filter(r => isPresent(r.status)).length;
      const roleBreakdown = ROLES.map(role => ({
        role,
        planned: shiftPlans.find(p => p.role === role)?.plannedCount ?? 0,
        actual: shiftRecords.filter(r => r.employee.role === role && isPresent(r.status)).length,
      }));
      return { shift, totalPlanned, present, percentage: totalPlanned ? Math.round(present / totalPlanned * 100) : 0, indicator: indicator(present, totalPlanned), roleBreakdown };
    });

    const totalPlanned = plans.reduce((s, p) => s + p.plannedCount, 0);
    const totalPresent = records.filter(r => isPresent(r.status)).length;

    const presentList    = records.filter(r => isPresent(r.status));
    const lateList       = records.filter(r => r.status === 'LATE');
    const earlyExitList  = records.filter(r => r.status === 'EARLY_EXIT');
    const absentList     = employees.filter(e => !records.find(r => r.employeeId === e.id && isPresent(r.status)));
    const notCheckedIn   = employees.filter(e => !records.find(r => r.employeeId === e.id && r.checkInTime));

    res.json({
      store, date: qDate,
      summary: { totalPlanned, totalPresent, percentage: totalPlanned ? Math.round(totalPresent / totalPlanned * 100) : 0, indicator: indicator(totalPresent, totalPlanned), lateCount: lateList.length, earlyExitCount: earlyExitList.length, absentCount: absentList.length },
      shiftBreakdown,
      employeeLists: { present: presentList, late: lateList, earlyExit: earlyExitList, absent: absentList, notCheckedIn },
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

export const opsDashboard = async (req: Request, res: Response): Promise<void> => {
  const { date, storeId } = req.query;
  const qDate = (date as string) || todayString();
  try {
    const stores = await prisma.store.findMany({ where: { isActive: true, ...(storeId && { id: storeId as string }) } });
    const isPresent = (s: string) => s === 'PRESENT' || s === 'LATE';

    const storeData = await Promise.all(stores.map(async store => {
      const [records, plans] = await Promise.all([
        prisma.attendanceRecord.findMany({ where: { storeId: store.id, date: qDate }, include: { employee: true, shift: true } }),
        prisma.manpowerPlan.findMany({ where: { storeId: store.id, date: qDate } }),
      ]);
      const totalPlanned = plans.reduce((s, p) => s + p.plannedCount, 0);
      const present = records.filter(r => isPresent(r.status)).length;
      const late = records.filter(r => r.status === 'LATE').length;
      const earlyExit = records.filter(r => r.status === 'EARLY_EXIT').length;
      const absent = Math.max(0, totalPlanned - present);
      const roleBreakdown = ROLES.map(role => ({
        role,
        planned: plans.filter(p => p.role === role).reduce((s, p) => s + p.plannedCount, 0),
        actual:  records.filter(r => r.employee.role === role && isPresent(r.status)).length,
      }));
      return { store, totalPlanned, present, late, earlyExit, absent, percentage: totalPlanned ? Math.round(present / totalPlanned * 100) : 0, indicator: indicator(present, totalPlanned), roleBreakdown };
    }));

    const g = storeData.reduce((a, s) => ({
      planned: a.planned + s.totalPlanned,
      present: a.present + s.present,
      late: a.late + s.late,
      earlyExit: a.earlyExit + s.earlyExit,
      absent: a.absent + s.absent,
    }), { planned: 0, present: 0, late: 0, earlyExit: 0, absent: 0 });

    res.json({
      date: qDate,
      stores: storeData,
      summary: { ...g, compliance: g.planned ? Math.round(g.present / g.planned * 100) : 0 },
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};

export const opsRangeDashboard = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, storeId } = req.query;
  if (!startDate || !endDate) { res.status(400).json({ error: 'startDate and endDate required' }); return; }
  try {
    const stores = await prisma.store.findMany({ where: { isActive: true, ...(storeId && { id: storeId as string }) } });
    const isPresent = (s: string) => s === 'PRESENT' || s === 'LATE';

    const [allRecords, allPlans] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { storeId: storeId ? storeId as string : undefined, date: { gte: startDate as string, lte: endDate as string } },
        include: { employee: true, shift: true, store: true },
      }),
      prisma.manpowerPlan.findMany({
        where: { storeId: storeId ? storeId as string : undefined, date: { gte: startDate as string, lte: endDate as string } },
      }),
    ]);

    const storeBreakdown = stores.map(store => {
      const recs  = allRecords.filter(r => r.storeId === store.id);
      const plans = allPlans.filter(p => p.storeId === store.id);
      const planned = plans.reduce((s, p) => s + p.plannedCount, 0);
      const present = recs.filter(r => isPresent(r.status)).length;
      return {
        store,
        planned,
        present,
        late: recs.filter(r => r.status === 'LATE').length,
        earlyExit: recs.filter(r => r.status === 'EARLY_EXIT').length,
        absent: recs.filter(r => r.status === 'ABSENT').length,
        compliance: planned ? Math.round(present / planned * 100) : 0,
      };
    });

    const totPlanned = allPlans.reduce((s, p) => s + p.plannedCount, 0);
    const totPresent = allRecords.filter(r => isPresent(r.status)).length;

    res.json({
      startDate, endDate,
      summary: {
        totalPlanned: totPlanned,
        totalPresent: totPresent,
        totalLate: allRecords.filter(r => r.status === 'LATE').length,
        totalEarlyExit: allRecords.filter(r => r.status === 'EARLY_EXIT').length,
        totalAbsent: allRecords.filter(r => r.status === 'ABSENT').length,
        compliance: totPlanned ? Math.round(totPresent / totPlanned * 100) : 0,
      },
      storeBreakdown,
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};
