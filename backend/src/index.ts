import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes       from './routes/auth.routes';
import storeRoutes      from './routes/store.routes';
import employeeRoutes   from './routes/employee.routes';
import shiftRoutes      from './routes/shift.routes';
import manpowerRoutes   from './routes/manpower.routes';
import attendanceRoutes from './routes/attendance.routes';
import dashboardRoutes  from './routes/dashboard.routes';
import reportRoutes     from './routes/report.routes';

const app = express();
const httpServer = createServer(app);

export const io = new SocketServer(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth',       authRoutes);
app.use('/api/stores',     storeRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/shifts',     shiftRoutes);
app.use('/api/manpower',   manpowerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/reports',    reportRoutes);
app.get ('/api/health',    (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

io.on('connection', socket => {
  socket.on('join:store', (storeId: string) => socket.join(`store:${storeId}`));
  socket.on('join:ops',   ()                 => socket.join('ops'));
  socket.on('disconnect', () => {/* cleanup */});
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 API running on :${PORT}`));

export default app;
