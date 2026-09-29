import { apiClient } from './client';
export const aiApi = {
  reconcile: (data: any) => apiClient.post('/ai/reconcile', data).then(r => r.data),
  getReport: (batchId: string) => apiClient.get('/ai/report/' + batchId).then(r => r.data),
};
