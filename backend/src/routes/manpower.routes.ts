import { Router } from 'express';
import * as c from '../controllers/manpower.controller';
import { authenticate, requireRole } from '../middleware/auth';

const r = Router();
r.get ('/',      authenticate, c.getAll);
r.post('/',      authenticate, requireRole('STORE_MANAGER', 'SHIFT_SUPERVISOR'), c.upsert);
r.post('/bulk',  authenticate, requireRole('STORE_MANAGER', 'SHIFT_SUPERVISOR'), c.bulkUpsert);
export default r;
