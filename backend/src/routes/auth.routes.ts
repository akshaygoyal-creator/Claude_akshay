import { Router } from 'express';
import { login, sendOtp, verifyOtp, verifyFace, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const r = Router();
r.post('/login',         login);
r.post('/otp/send',      sendOtp);
r.post('/otp/verify',    verifyOtp);
r.post('/face/verify',   verifyFace);
r.get ('/me',            authenticate, getMe);
export default r;
