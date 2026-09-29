import { apiClient } from './client';
export const challengeApi = {
  create: (data: { batchId: string; challenger: string; reason: string; txHash: string }) => apiClient.post('/challenge/', data).then(r => r.data),
  getByBatch: (batchId: string) => apiClient.get('/challenge/' + batchId).then(r => r.data),
};
