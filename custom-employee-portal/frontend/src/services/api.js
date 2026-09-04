import axios from 'axios';
import { getToken, clearSession } from '../utils/auth';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const zohoApi = {
  getApps: () => api.get('/zoho/apps'),
  launch: (appKey) => api.post(`/zoho/launch/${appKey}`),
};

export const adminApi = {
  listUsers: () => api.get('/admin/users'),
  createUser: (payload) => api.post('/admin/users', payload),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  listRoles: () => api.get('/admin/roles'),
  listPermissions: () => api.get('/admin/permissions'),
  listAuditLogs: () => api.get('/admin/audit-logs'),
};

export default api;
