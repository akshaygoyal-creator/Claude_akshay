import { Router } from 'express';
import * as c from '../controllers/attendance.controller';
import { authenticate, requireRole } from '../middleware/auth';

const r = Router();
r.post('/checkin',              authenticate, c.checkIn);
r.post('/checkout',             authenticate, c.checkOut);
r.get ('/my',                   authenticate, c.myAttendance);
r.get ('/today',                authenticate, c.todayAttendance);
r.put ('/override/:recordId',   authenticate, requireRole('STORE_MANAGER', 'SHIFT_SUPERVISOR'), c.override);
r.get ('/store/:storeId',       authenticate, requireRole('STORE_MANAGER', 'SHIFT_SUPERVISOR'), c.storeAttendance);
export default r;
