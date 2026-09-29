import { apiClient } from './client';
export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data).then(r => r.data),
  register: (data: any) => apiClient.post('/auth/register', data).then(r => r.data),
  getMe: () => apiClient.get('/auth/me').then(r => r.data),
};
