import { Router } from 'express';
import { exportReport } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const r = Router();
r.get('/export', authenticate, exportReport);
export default r;
