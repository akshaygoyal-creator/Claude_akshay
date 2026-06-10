import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Stores ─────────────────────────────────────────────────────────────────
  const storeData = [
    { storeCode: 'LIC-BLR-001', name: 'Licious Indiranagar',   latitude: 12.9784, longitude: 77.6408, address: '100 Feet Road, Indiranagar', city: 'Bangalore' },
    { storeCode: 'LIC-BLR-002', name: 'Licious Koramangala',   latitude: 12.9352, longitude: 77.6245, address: '5th Block, Koramangala',     city: 'Bangalore' },
    { storeCode: 'LIC-HYD-001', name: 'Licious Banjara Hills', latitude: 17.4100, longitude: 78.4482, address: 'Road No. 12, Banjara Hills', city: 'Hyderabad' },
    { storeCode: 'LIC-MUM-001', name: 'Licious Andheri',       latitude: 19.1136, longitude: 72.8697, address: 'Veera Desai Road, Andheri',  city: 'Mumbai'    },
  ];

  for (const s of storeData) {
    await prisma.store.upsert({
      where: { storeCode: s.storeCode },
      update: {},
      create: { id: uuidv4(), ...s, geofenceRadius: 100 },
    });
  }

  const stores = await prisma.store.findMany();
  console.log(`✅ ${stores.length} stores`);

  // ── Shifts ─────────────────────────────────────────────────────────────────
  const shiftTemplates = [
    { shiftCode: 'MORNING',   name: 'Morning Shift',   startTime: '07:00', endTime: '15:00' },
    { shiftCode: 'AFTERNOON', name: 'Afternoon Shift', startTime: '15:00', endTime: '23:00' },
    { shiftCode: 'NIGHT',     name: 'Night Shift',     startTime: '23:00', endTime: '07:00' },
  ];

  for (const store of stores) {
    for (const t of shiftTemplates) {
      const existing = await prisma.shift.findFirst({ where: { shiftCode: t.shiftCode, storeId: store.id } });
      if (!existing) {
        await prisma.shift.create({ data: { id: uuidv4(), ...t, storeId: store.id } });
      }
    }
  }

  const allShifts = await prisma.shift.findMany();
  console.log(`✅ ${allShifts.length} shifts`);

  // ── Employees ──────────────────────────────────────────────────────────────
  const defaultHash = await bcrypt.hash('Licious@123', 10);

  const employeeTemplates = (storeCode: string) => [
    { suffix: 'MGR01', name: 'Store Manager',      role: 'STORE_MANAGER'    as const, type: 'FULL_TIME' as const },
    { suffix: 'SUP01', name: 'Supervisor Morning', role: 'SHIFT_SUPERVISOR' as const, type: 'FULL_TIME' as const },
    { suffix: 'SUP02', name: 'Supervisor Evening', role: 'SHIFT_SUPERVISOR' as const, type: 'FULL_TIME' as const },
    { suffix: 'MT001', name: 'Technician 1',       role: 'MEAT_TECHNICIAN'  as const, type: 'FULL_TIME' as const },
    { suffix: 'MT002', name: 'Technician 2',       role: 'MEAT_TECHNICIAN'  as const, type: 'PART_TIME' as const },
    { suffix: 'MT003', name: 'Technician 3',       role: 'MEAT_TECHNICIAN'  as const, type: 'PART_TIME' as const },
  ].map((t, i) => ({
    employeeCode: `${storeCode}-${t.suffix}`,
    name: `${t.name} (${storeCode})`,
    email: `${t.suffix.toLowerCase()}.${storeCode.toLowerCase().replace(/-/g, '')}@licious.com`,
    phone: `9${storeCode.replace(/-/g, '').slice(-3)}${String(i).padStart(7, '0')}`,
    role: t.role,
    type: t.type,
  }));

  for (const store of stores) {
    for (const emp of employeeTemplates(store.storeCode)) {
      await prisma.employee.upsert({
        where: { email: emp.email },
        update: {},
        create: {
          id: uuidv4(),
          ...emp,
          passwordHash: defaultHash,
          storeId: store.id,
          faceDataRef: `face_ref_${uuidv4()}`,
        },
      });
    }
  }

  // Ops admin (can access all stores; assigned to first store)
  await prisma.employee.upsert({
    where: { email: 'ops@licious.com' },
    update: {},
    create: {
      id: uuidv4(),
      employeeCode: 'LIC-OPS-001',
      name: 'Ops Admin',
      email: 'ops@licious.com',
      phone: '9000000001',
      passwordHash: defaultHash,
      type: 'FULL_TIME',
      role: 'STORE_MANAGER',
      storeId: stores[0].id,
      faceDataRef: 'face_ref_ops_admin',
    },
  });

  const employees = await prisma.employee.findMany();
  console.log(`✅ ${employees.length} employees`);

  // ── Manpower Plans (today + 6 days) ───────────────────────────────────────
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);
    const dateStr = dt.toISOString().split('T')[0];

    for (const store of stores) {
      const storeShifts = allShifts.filter(s => s.storeId === store.id);
      for (const shift of storeShifts) {
        const plans = [
          { role: 'STORE_MANAGER'    as const, plannedCount: 1 },
          { role: 'SHIFT_SUPERVISOR' as const, plannedCount: 1 },
          { role: 'MEAT_TECHNICIAN'  as const, plannedCount: 2 },
        ];
        for (const p of plans) {
          await prisma.manpowerPlan.upsert({
            where: { storeId_shiftId_role_date: { storeId: store.id, shiftId: shift.id, role: p.role, date: dateStr } },
            update: {},
            create: { id: uuidv4(), storeId: store.id, shiftId: shift.id, ...p, date: dateStr },
          });
        }
      }
    }
  }
  console.log('✅ Manpower plans created');

  // ── Sample attendance for today ────────────────────────────────────────────
  const todayStr = today.toISOString().split('T')[0];
  for (const store of stores) {
    const morningShift = allShifts.find(s => s.storeId === store.id && s.shiftCode === 'MORNING');
    if (!morningShift) continue;

    const storeEmps = employees.filter(e => e.storeId === store.id).slice(0, 4);
    const statuses: Array<'PRESENT' | 'LATE' | 'ABSENT' | 'PRESENT'> = ['PRESENT', 'LATE', 'PRESENT', 'ABSENT'];

    for (let i = 0; i < storeEmps.length; i++) {
      const emp = storeEmps[i];
      const status = statuses[i];
      const existing = await prisma.attendanceRecord.findUnique({
        where: { employeeId_shiftId_date: { employeeId: emp.id, shiftId: morningShift.id, date: todayStr } },
      });
      if (existing || status === 'ABSENT') continue;

      const checkIn = new Date(today);
      checkIn.setHours(status === 'LATE' ? 8 : 7, Math.floor(Math.random() * 20), 0, 0);

      await prisma.attendanceRecord.create({
        data: {
          id: uuidv4(),
          employeeId: emp.id,
          storeId: store.id,
          shiftId: morningShift.id,
          date: todayStr,
          checkInTime: checkIn,
          loginMethod: i % 2 === 0 ? 'FACE_BIOMETRIC' : 'OTP',
          checkInLat: store.latitude  + (Math.random() - 0.5) * 0.001,
          checkInLng: store.longitude + (Math.random() - 0.5) * 0.001,
          status,
        },
      });
    }
  }
  console.log('✅ Sample attendance records');

  console.log('\n🎉 Seed complete!');
  console.log('\nDemo credentials (all passwords: Licious@123)');
  console.log('  ops@licious.com                 → Ops Admin (STORE_MANAGER)');
  console.log('  mgr01.licblr001@licious.com     → Store Manager, Indiranagar');
  console.log('  mt001.licblr001@licious.com     → Meat Technician, Indiranagar');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
