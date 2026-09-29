import { apiClient } from './client';
export const blockchainApi = {
  getConfig: () => apiClient.get('/blockchain/config').then(r => r.data),
  getLifecycle: (batchId: string) => apiClient.get('/blockchain/lifecycle/' + batchId).then(r => r.data),
  anchor: (data: { action: string; batchId: string; [key: string]: any }) => apiClient.post('/blockchain/anchor', data).then(r => r.data),
};
