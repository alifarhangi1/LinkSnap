import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
  }) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  updateProfile: (data: { first_name?: string; last_name?: string; email?: string }) =>
    api.patch('/auth/me/', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password/', data),
};

export const linksApi = {
  list: () => api.get('/links/'),
  create: (data: { original_url: string; title?: string; custom_code?: string; expires_at?: string | null }) =>
    api.post('/links/', data),
  get: (id: number) => api.get(`/links/${id}/`),
  update: (id: number, data: Partial<{ title: string; is_active: boolean; expires_at: string | null }>) =>
    api.patch(`/links/${id}/`, data),
  delete: (id: number) => api.delete(`/links/${id}/`),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats/'),
};

export default api;
