import { Router } from 'express';
import * as c from '../controllers/store.controller';
import { authenticate, requireRole } from '../middleware/auth';

const r = Router();
r.get ('/',    authenticate, c.getAll);
r.get ('/:id', authenticate, c.getById);
r.post('/',    authenticate, requireRole('STORE_MANAGER'), c.create);
r.put ('/:id', authenticate, requireRole('STORE_MANAGER'), c.update);
export default r;
