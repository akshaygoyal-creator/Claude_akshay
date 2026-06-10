import { Router } from 'express';
import * as c from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth';

const r = Router();
r.get('/store/:storeId', authenticate, requireRole('STORE_MANAGER', 'SHIFT_SUPERVISOR'), c.storeDashboard);
r.get('/ops',            authenticate, c.opsDashboard);
r.get('/ops/range',      authenticate, c.opsRangeDashboard);
export default r;
