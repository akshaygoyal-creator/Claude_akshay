import { Router } from 'express';
import * as c from '../controllers/employee.controller';
import { authenticate, requireRole } from '../middleware/auth';

const r = Router();
r.get   ('/',    authenticate, c.getAll);
r.get   ('/:id', authenticate, c.getById);
r.post  ('/',    authenticate, requireRole('STORE_MANAGER', 'SHIFT_SUPERVISOR'), c.create);
r.put   ('/:id', authenticate, requireRole('STORE_MANAGER', 'SHIFT_SUPERVISOR'), c.update);
r.delete('/:id', authenticate, requireRole('STORE_MANAGER'), c.deactivate);
export default r;
