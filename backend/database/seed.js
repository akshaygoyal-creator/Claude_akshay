const { getDb } = require('./schema');
const { v4: uuidv4 } = require('uuid');

function seed() {
  const db = getDb();

  // Clear existing data
  db.exec(`
    DELETE FROM attendance_records;
    DELETE FROM manpower_plans;
    DELETE FROM shifts;
    DELETE FROM employees;
    DELETE FROM stores;
  `);

  // Seed Stores
  const stores = [
    { id: 'store-001', name: 'Licious - Indiranagar', lat: 12.9716, lng: 77.6412, address: '100 CMH Road, Indiranagar', city: 'Bangalore' },
    { id: 'store-002', name: 'Licious - Koramangala', lat: 12.9352, lng: 77.6245, address: '80 Feet Road, Koramangala 4th Block', city: 'Bangalore' },
    { id: 'store-003', name: 'Licious - HSR Layout', lat: 12.9116, lng: 77.6389, address: 'Sector 1, HSR Layout', city: 'Bangalore' },
    { id: 'store-004', name: 'Licious - Banjara Hills', lat: 17.4156, lng: 78.4347, address: 'Road No 12, Banjara Hills', city: 'Hyderabad' },
    { id: 'store-005', name: 'Licious - Jubilee Hills', lat: 17.4225, lng: 78.4073, address: 'Road No 36, Jubilee Hills', city: 'Hyderabad' },
    { id: 'store-006', name: 'Licious - Anna Nagar', lat: 13.0850, lng: 80.2101, address: 'Anna Nagar 2nd Avenue', city: 'Chennai' },
  ];

  const insertStore = db.prepare(`INSERT INTO stores (id, name, lat, lng, address, city) VALUES (?, ?, ?, ?, ?, ?)`);
  stores.forEach(s => insertStore.run(s.id, s.name, s.lat, s.lng, s.address, s.city));

  // Seed Shifts per store
  const shiftDefs = [
    { name: 'Morning Shift', start: '07:00', end: '15:00' },
    { name: 'Afternoon Shift', start: '12:00', end: '20:00' },
    { name: 'Evening Shift', start: '15:00', end: '23:00' },
  ];

  const insertShift = db.prepare(`INSERT INTO shifts (id, name, start_time, end_time, store_id) VALUES (?, ?, ?, ?, ?)`);
  const allShifts = [];
  stores.forEach(store => {
    shiftDefs.forEach(sd => {
      const shiftId = `shift-${store.id}-${sd.name.replace(/\s+/g, '').toLowerCase()}`;
      insertShift.run(shiftId, sd.name, sd.start, sd.end, store.id);
      allShifts.push({ id: shiftId, storeId: store.id, name: sd.name });
    });
  });

  // Seed Employees
  const roles = ['Store Manager', 'Shift Supervisor', 'Meat Technician'];
  const types = ['Full-Time', 'Part-Time'];
  const firstNames = ['Arjun', 'Priya', 'Rahul', 'Deepa', 'Vikram', 'Sneha', 'Kiran', 'Anita', 'Suresh', 'Meena', 'Rajesh', 'Kavita', 'Amit', 'Pooja', 'Sanjay'];
  const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Nair', 'Singh', 'Gupta', 'Patel', 'Rao', 'Iyer', 'Menon'];

  const insertEmployee = db.prepare(`INSERT INTO employees (id, name, type, role, store_id, phone, face_biometric_ref) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const allEmployees = [];
  let phoneNum = 9000000001;

  stores.forEach(store => {
    // 1 Store Manager
    const mgr = { id: `emp-${store.id}-mgr`, name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`, type: 'Full-Time', role: 'Store Manager', storeId: store.id, phone: String(phoneNum++) };
    insertEmployee.run(mgr.id, mgr.name, mgr.type, mgr.role, mgr.storeId, mgr.phone, `biometric-ref-${mgr.id}`);
    allEmployees.push(mgr);

    // 3 Shift Supervisors
    for (let i = 0; i < 3; i++) {
      const sup = { id: `emp-${store.id}-sup-${i}`, name: `${firstNames[(phoneNum) % firstNames.length]} ${lastNames[(phoneNum) % lastNames.length]}`, type: 'Full-Time', role: 'Shift Supervisor', storeId: store.id, phone: String(phoneNum++) };
      insertEmployee.run(sup.id, sup.name, sup.type, sup.role, sup.storeId, sup.phone, `biometric-ref-${sup.id}`);
      allEmployees.push(sup);
    }

    // 8 Meat Technicians (mix of FT/PT)
    for (let i = 0; i < 8; i++) {
      const tech = { id: `emp-${store.id}-tech-${i}`, name: `${firstNames[(phoneNum) % firstNames.length]} ${lastNames[(phoneNum) % lastNames.length]}`, type: i < 5 ? 'Full-Time' : 'Part-Time', role: 'Meat Technician', storeId: store.id, phone: String(phoneNum++) };
      insertEmployee.run(tech.id, tech.name, tech.type, tech.role, tech.storeId, tech.phone, `biometric-ref-${tech.id}`);
      allEmployees.push(tech);
    }
  });

  // Seed Manpower Plans (for today and past 7 days)
  const insertPlan = db.prepare(`INSERT OR IGNORE INTO manpower_plans (id, store_id, shift_id, role, planned_count, plan_date) VALUES (?, ?, ?, ?, ?, ?)`);

  const rolePlans = { 'Store Manager': 1, 'Shift Supervisor': 1, 'Meat Technician': 3 };

  for (let d = -7; d <= 1; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    allShifts.forEach(shift => {
      Object.entries(rolePlans).forEach(([role, count]) => {
        const planId = `plan-${shift.id}-${role.replace(/\s+/g, '')}-${dateStr}`;
        insertPlan.run(planId, shift.storeId, shift.id, role, count, dateStr);
      });
    });
  }

  // Seed realistic attendance records for past 7 days
  const insertAttendance = db.prepare(`INSERT OR IGNORE INTO attendance_records
    (id, employee_id, store_id, shift_id, check_in_time, check_out_time, login_method, check_in_lat, check_in_lng, status, attendance_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const statuses = ['Present', 'Present', 'Present', 'Late', 'Present', 'Absent', 'Present'];
  const methods = ['Face Biometric', 'Face Biometric', 'OTP'];

  for (let d = -6; d <= 0; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    allEmployees.forEach((emp, idx) => {
      const store = stores.find(s => s.id === emp.storeId);
      const storeShifts = allShifts.filter(s => s.storeId === emp.storeId);
      const shift = storeShifts[idx % storeShifts.length];
      const status = statuses[(idx + d) % statuses.length];
      const method = methods[idx % methods.length];

      if (status !== 'Absent') {
        const checkInHour = status === 'Late' ? 8 : 7;
        const checkInTime = `${dateStr}T0${checkInHour}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}:00`;
        const checkOutTime = `${dateStr}T15:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}:00`;
        const recId = `att-${emp.id}-${dateStr}`;
        insertAttendance.run(
          recId, emp.id, emp.storeId, shift.id,
          checkInTime, checkOutTime, method,
          store.lat + (Math.random() - 0.5) * 0.0003,
          store.lng + (Math.random() - 0.5) * 0.0003,
          status, dateStr
        );
      }
    });
  }

  console.log(`Seeded: ${stores.length} stores, ${allEmployees.length} employees, ${allShifts.length} shifts`);
  console.log('Seed complete!');
}

seed();
