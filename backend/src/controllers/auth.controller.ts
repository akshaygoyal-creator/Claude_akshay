import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

function signToken(emp: { id: string; role: string; storeId: string; email: string }) {
  return jwt.sign(
    { id: emp.id, role: emp.role, storeId: emp.storeId, email: emp.email },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
  );
}

function safeEmployee(emp: Record<string, unknown>, storeName?: string) {
  const { passwordHash: _ph, ...rest } = emp as Record<string, unknown> & { passwordHash?: string };
  return { ...rest, storeName };
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: 'email and password required' }); return; }
  try {
    const emp = await prisma.employee.findUnique({ where: { email }, include: { store: true } });
    if (!emp || !emp.isActive) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    if (!(await bcrypt.compare(password, emp.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' }); return;
    }
    const token = signToken(emp);
    res.json({ token, employee: safeEmployee(emp as unknown as Record<string, unknown>, emp.store.name) });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;
  if (!phone) { res.status(400).json({ error: 'phone required' }); return; }
  try {
    const emp = await prisma.employee.findUnique({ where: { phone } });
    if (!emp || !emp.isActive) { res.status(404).json({ error: 'Employee not found' }); return; }
    await prisma.otpToken.updateMany({ where: { employeeId: emp.id, used: false }, data: { used: true } });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60_000);
    await prisma.otpToken.create({ data: { id: uuidv4(), employeeId: emp.id, otp, expiresAt } });
    // In production send via SMS gateway; return here for demo purposes
    res.json({ message: 'OTP sent', otp /* REMOVE IN PRODUCTION */ });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { phone, otp } = req.body;
  if (!phone || !otp) { res.status(400).json({ error: 'phone and otp required' }); return; }
  try {
    const emp = await prisma.employee.findUnique({ where: { phone }, include: { store: true } });
    if (!emp) { res.status(404).json({ error: 'Employee not found' }); return; }
    const record = await prisma.otpToken.findFirst({
      where: { employeeId: emp.id, otp, used: false, expiresAt: { gt: new Date() } },
    });
    if (!record) { res.status(401).json({ error: 'Invalid or expired OTP' }); return; }
    await prisma.otpToken.update({ where: { id: record.id }, data: { used: true } });
    const token = signToken(emp);
    res.json({ token, employee: safeEmployee(emp as unknown as Record<string, unknown>, emp.store.name) });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const verifyFace = async (req: Request, res: Response): Promise<void> => {
  const { employeeId, faceData } = req.body;
  if (!employeeId || !faceData) { res.status(400).json({ error: 'employeeId and faceData required' }); return; }
  try {
    const emp = await prisma.employee.findUnique({ where: { id: employeeId }, include: { store: true } });
    if (!emp || !emp.isActive) { res.status(404).json({ error: 'Employee not found' }); return; }
    if (!emp.faceDataRef) { res.status(400).json({ error: 'No face data registered' }); return; }
    // ── Face recognition stub ──────────────────────────────────────────────
    // Replace with: const match = await faceRecognitionService.compare(faceData, emp.faceDataRef);
    const match = Math.random() > 0.08; // 92% success for demo
    if (!match) { res.status(401).json({ error: 'Face not recognised. Try OTP login.' }); return; }
    // ───────────────────────────────────────────────────────────────────────
    const token = signToken(emp);
    res.json({ token, loginMethod: 'FACE_BIOMETRIC', employee: safeEmployee(emp as unknown as Record<string, unknown>, emp.store.name) });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const emp = await prisma.employee.findUnique({ where: { id: req.user!.id }, include: { store: true } });
    if (!emp) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(safeEmployee(emp as unknown as Record<string, unknown>, emp.store.name));
  } catch { res.status(500).json({ error: 'Server error' }); }
};
