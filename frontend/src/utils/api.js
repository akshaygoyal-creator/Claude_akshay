import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const storesApi = {
  getAll: () => api.get('/stores').then(r => r.data),
  getById: (id) => api.get(`/stores/${id}`).then(r => r.data),
  create: (data) => api.post('/stores', data).then(r => r.data),
};

export const employeesApi = {
  getAll: (params) => api.get('/employees', { params }).then(r => r.data),
  getById: (id) => api.get(`/employees/${id}`).then(r => r.data),
  getByPhone: (phone) => api.get(`/employees/lookup/phone/${phone}`).then(r => r.data),
};

export const shiftsApi = {
  getAll: (params) => api.get('/shifts', { params }).then(r => r.data),
  getCurrent: (storeId) => api.get(`/shifts/current/${storeId}`).then(r => r.data),
  getForEmployee: (empId) => api.get(`/shifts/employee/${empId}`).then(r => r.data),
};

export const manpowerApi = {
  getPlans: (params) => api.get('/manpower', { params }).then(r => r.data),
  upsert: (data) => api.post('/manpower', data).then(r => r.data),
  bulkUpsert: (plans) => api.post('/manpower/bulk', { plans }).then(r => r.data),
};

export const attendanceApi = {
  getAll: (params) => api.get('/attendance', { params }).then(r => r.data),
  getStoreSummary: (storeId, params) => api.get(`/attendance/summary/store/${storeId}`, { params }).then(r => r.data),
  getOpsSummary: (params) => api.get('/attendance/summary/ops', { params }).then(r => r.data),
  checkIn: (data) => api.post('/attendance/checkin', data).then(r => r.data),
  checkOut: (data) => api.post('/attendance/checkout', data).then(r => r.data),
  sendOtp: (phone) => api.post('/attendance/otp/send', { phone }).then(r => r.data),
  verifyOtp: (phone, otp) => api.post('/attendance/otp/verify', { phone, otp }).then(r => r.data),
  override: (data) => api.post('/attendance/override', data).then(r => r.data),
  export: (params) => api.get('/attendance/export', { params, responseType: 'blob' }).then(r => r.data),
};

export default api;
