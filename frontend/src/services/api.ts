import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login:      (email: string, password: string) => api.post('/auth/login', { email, password }),
  sendOtp:    (phone: string)                   => api.post('/auth/otp/send', { phone }),
  verifyOtp:  (phone: string, otp: string)      => api.post('/auth/otp/verify', { phone, otp }),
  verifyFace: (employeeId: string, faceData: string) => api.post('/auth/face/verify', { employeeId, faceData }),
  getMe:      ()                                => api.get('/auth/me'),
};

export const storeApi = {
  getAll:  ()                                         => api.get('/stores'),
  getById: (id: string)                               => api.get(`/stores/${id}`),
  create:  (data: Record<string, unknown>)             => api.post('/stores', data),
  update:  (id: string, data: Record<string, unknown>) => api.put(`/stores/${id}`, data),
};

export const employeeApi = {
  getAll:     (params?: Record<string, string>)                       => api.get('/employees', { params }),
  getById:    (id: string)                                             => api.get(`/employees/${id}`),
  create:     (data: Record<string, unknown>)                          => api.post('/employees', data),
  update:     (id: string, data: Record<string, unknown>)              => api.put(`/employees/${id}`, data),
  deactivate: (id: string)                                             => api.delete(`/employees/${id}`),
};

export const shiftApi = {
  getAll: (storeId?: string) => api.get('/shifts', { params: storeId ? { storeId } : {} }),
  create: (data: Record<string, unknown>) => api.post('/shifts', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/shifts/${id}`, data),
};

export const manpowerApi = {
  getAll:     (params?: Record<string, string>)  => api.get('/manpower', { params }),
  upsert:     (data: Record<string, unknown>)     => api.post('/manpower', data),
  bulkUpsert: (plans: unknown[])                  => api.post('/manpower/bulk', { plans }),
};

export const attendanceApi = {
  checkIn:         (data: { shiftId: string; latitude: number; longitude: number; loginMethod: string }) => api.post('/attendance/checkin', data),
  checkOut:        (shiftId: string)                              => api.post('/attendance/checkout', { shiftId }),
  myAttendance:    (params?: Record<string, string>)              => api.get('/attendance/my', { params }),
  todayAttendance: ()                                             => api.get('/attendance/today'),
  override:        (recordId: string, status: string, reason: string) => api.put(`/attendance/override/${recordId}`, { status, reason }),
  storeAttendance: (storeId: string, date?: string)              => api.get(`/attendance/store/${storeId}`, { params: date ? { date } : {} }),
};

export const dashboardApi = {
  getStore:  (storeId: string, date?: string)           => api.get(`/dashboard/store/${storeId}`, { params: date ? { date } : {} }),
  getOps:    (params?: Record<string, string>)           => api.get('/dashboard/ops', { params }),
  getOpsRange: (params: Record<string, string>)          => api.get('/dashboard/ops/range', { params }),
};

export const reportApi = {
  exportDirect: (params: Record<string, string>) =>
    api.get('/reports/export', { params, responseType: 'blob' }),
};

export default api;
