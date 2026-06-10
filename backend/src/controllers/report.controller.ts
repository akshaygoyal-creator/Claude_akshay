import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import prisma from '../config/prisma';

export const exportReport = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, storeId, format = 'xlsx' } = req.query;
  if (!startDate || !endDate) { res.status(400).json({ error: 'startDate and endDate required' }); return; }

  try {
    const records = await prisma.attendanceRecord.findMany({
      where: {
        ...(storeId && { storeId: storeId as string }),
        date: { gte: startDate as string, lte: endDate as string },
      },
      include: { employee: true, shift: true, store: true },
      orderBy: [{ date: 'asc' }, { store: { name: 'asc' } }, { employee: { name: 'asc' } }],
    });

    const rows = records.map(r => ({
      Date:               r.date,
      Store:              r.store.name,
      City:               r.store.city,
      'Employee Code':    r.employee.employeeCode,
      'Employee Name':    r.employee.name,
      Role:               r.employee.role.replace(/_/g, ' '),
      Type:               r.employee.type.replace(/_/g, ' '),
      Shift:              r.shift.name,
      'Shift Start':      r.shift.startTime,
      'Shift End':        r.shift.endTime,
      'Check-In':         r.checkInTime  ? new Date(r.checkInTime).toLocaleTimeString()  : '-',
      'Check-Out':        r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-',
      'Login Method':     r.loginMethod ? r.loginMethod.replace(/_/g, ' ') : '-',
      Status:             r.status.replace(/_/g, ' '),
      'Override Reason':  r.overrideReason || '-',
    }));

    if (format === 'csv') {
      if (rows.length === 0) { res.json([]); return; }
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(','),
        ...rows.map(row => headers.map(h => `"${String((row as Record<string, unknown>)[h] ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance_${startDate}_${endDate}.csv"`);
      res.send(csv);
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] ?? {}).map(k => ({ wch: Math.max(k.length, ...rows.map(r => String((r as Record<string, unknown>)[k] ?? '').length)) + 2 }));
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    const summary = [
      { Metric: 'Date Range',  Value: `${startDate} → ${endDate}` },
      { Metric: 'Total',       Value: records.length },
      { Metric: 'Present',     Value: records.filter(r => r.status === 'PRESENT').length },
      { Metric: 'Late',        Value: records.filter(r => r.status === 'LATE').length },
      { Metric: 'Absent',      Value: records.filter(r => r.status === 'ABSENT').length },
      { Metric: 'Early Exit',  Value: records.filter(r => r.status === 'EARLY_EXIT').length },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Summary');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${startDate}_${endDate}.xlsx"`);
    res.send(buf);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
};
